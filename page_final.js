(() => {
  "use strict";

  const HOOK_EVENT = "__chatgpt_copy_cleaner_hooked__";
  const BYPASS_MARKER = "\x00__COPY_CLEANER_BYPASS__\x00";

  // Settings cache
  let isExtensionEnabled = true;
  let cleaningMode = "aggressive";
  let protectCodeBlocks = true;
  let showNotifications = true;

  // Listen for state updates from the content script via postMessage
  window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }

    const data = event.data;
    // Check for our specific message type and payload
    if (data?.type === 'CLEANER_STATE_UPDATE' && data.payload) {
      if (typeof data.payload.enabled === 'boolean') {
        isExtensionEnabled = data.payload.enabled;
      }
      if (typeof data.payload.mode === 'string') {
        cleaningMode = data.payload.mode;
      }
      if (typeof data.payload.protectCodeBlocks === 'boolean') {
        protectCodeBlocks = data.payload.protectCodeBlocks;
      }
      if (typeof data.payload.showNotifications === 'boolean') {
        showNotifications = data.payload.showNotifications;
      }
    }
  }, false);

  const escapeHtml = (s) => String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const toHtml = (text) => {
    const esc = escapeHtml(text);
    return `<div style="white-space:pre-wrap;font-family:inherit;">${esc}</div>`;
  };

  // --- Cleaning Functions ---

  /**
   * Strip trailing reference definition blocks (handles multi-line wrapped URLs)
   */
  function stripTrailingReferenceBlock(text) {
    const lines = text.split(/\r?\n/);

    while (lines.length) {
      const last = lines[lines.length - 1].trim();
      if (last === "") { lines.pop(); continue; }

      // Reference definition start: [1]: ... or [MDN Web Docs]:
      if (/^\[[^\]]+\]:/.test(last)) { lines.pop(); continue; }

      // Continuations / wrapped link junk
      if (/^https?:\/\//i.test(last)) { lines.pop(); continue; }
      if (/utm_/i.test(last)) { lines.pop(); continue; }
      if (/^hatgpt\.com/i.test(last)) { lines.pop(); continue; } // wrapped "chatgpt.com"

      // Wrapped URL continuation line (URL fragments split mid-token)
      if (/^[a-z0-9\-_/.?=&%]+$/i.test(last) && last.length < 120) { lines.pop(); continue; }

      break;
    }

    return lines.join("\n");
  }

  /**
   * Aggressive mode: Remove ALL links, URLs, citations, and reference markers
   */
  function cleanAggressive(text) {
    let t = String(text ?? "");
    // ChatGPT special cite markers (sometimes appear in copied output)
    t = t.replace(/\s*cite[^]+/g, "");
    // Reference definitions: [1]: https://... OR [Label]: https://...
    t = t.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, "");
    // Inline markdown links: [label](url) -> label
    t = t.replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, "$1");
    // Reference-style markdown links: [label][anything] -> label
    t = t.replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1");
    // Parenthesized reference: ([Title][1]) plus arrow notes
    t = t.replace(/\s*\(\[[^\]]+\]\[[^\]]+\]\)\s*(?:<-+.*)?/g, "");
    // Bare bracket markers leftover: [1], [Source]
    t = t.replace(/\s*\[[^\]]+\]/g, "");
    // Autolinks: <https://...>
    t = t.replace(/<https?:\/\/[^>]+>/gi, "");
    // Raw URLs
    t = t.replace(/\bhttps?:\/\/\S+/gi, "");
    t = t.replace(/\bwww\.\S+/gi, "");
    // "Source badge" crumbs like: "MDN Web Docs+1"
    t = t.replace(/(^|\s)[A-Z][A-Za-z0-9 .,&/\\-]{2,80}\+\d+\b/g, "$1");
    // Empty parens from removals
    t = t.replace(/\(\s*\)/g, "");
    // Normalize whitespace
    t = t.replace(/[ \t]+/g, " ");
    t = t.replace(/ *\n */g, "\n");
    t = t.replace(/\n{3,}/g, "\n\n");
    // Strip trailing multi-line reference blocks
    t = stripTrailingReferenceBlock(t);
    return t.trim();
  }

  /**
   * Conservative mode: Keep intentional inline links, remove citation noise only
   */
  function cleanConservative(text) {
    let t = String(text ?? "");
    // Remove cite markers
    t = t.replace(/\s*cite[^]+/g, "");
    // Remove reference definitions: [1]: https://...
    t = t.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, "");
    // Remove reference-style links: [text][1] -> text
    t = t.replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1");
    // Remove parenthesized references: ([Title][1])
    t = t.replace(/\s*\(\[[^\]]+\]\[[^\]]+\]\)\s*(?:<-+.*)?/g, "");
    // Remove bare citation markers like [1] but preserve code-like [0], [i]
    t = t.replace(/\s*\[\d+\]/g, "");
    // Remove autolinks: <https://...>
    t = t.replace(/<https?:\/\/[^>]+>/gi, "");
    // Strip UTM parameters from URLs
    t = t.replace(/(\bhttps?:\/\/[^\s?]+)\?utm_[^\s)]*/gi, "$1");
    // Remove source badges: "MDN+1"
    t = t.replace(/(^|\s)[A-Z][A-Za-z0-9 .,&/\\-]{2,80}\+\d+\b/g, "$1");
    // Clean up empty parens
    t = t.replace(/\(\s*\)/g, "");
    // Normalize whitespace
    t = t.replace(/[ \t]+/g, " ");
    t = t.replace(/ *\n */g, "\n");
    t = t.replace(/\n{3,}/g, "\n\n");
    // Strip trailing multi-line reference blocks
    t = stripTrailingReferenceBlock(t);
    return t.trim();
  }

  /**
   * Apply cleaning based on current mode
   */
  function cleanText(text) {
    return cleaningMode === "conservative" ? cleanConservative(text) : cleanAggressive(text);
  }

  /**
   * Clean text, optionally protecting code blocks
   */
  function cleanCopiedText(text) {
    if (!protectCodeBlocks) return cleanText(text);
    const parts = String(text ?? "").split(/(```[\s\S]*?```|`[^`\n]+`)/g);
    return parts.map((p, i) => (i % 2 === 1 ? p : cleanText(p))).join("");
  }

  async function patchClipboard() {
    const clipboard = navigator.clipboard;
    if (!clipboard) return { ok: false, reason: "no navigator.clipboard" };

    // Patch writeText
    if (typeof clipboard.writeText === "function") {
      const origWriteText = clipboard.writeText.bind(clipboard);
      clipboard.writeText = async (text) => {
        if (!isExtensionEnabled) {
          return await origWriteText(text);
        }
        try {
          // Check for bypass marker (set by content script click interception)
          if (typeof text === "string" && text.startsWith(BYPASS_MARKER)) {
            const unmarked = text.slice(BYPASS_MARKER.length);
            if (showNotifications) {
              console.log("[Copy Cleaner] Clipboard writeText bypassed (already cleaned)");
            }
            return await origWriteText(unmarked);
          }

          const cleaned = cleanCopiedText(text);
          if (showNotifications) {
            console.log("[Copy Cleaner] Clipboard writeText cleaned");
          }
          return await origWriteText(cleaned);
        } catch (e) {
          console.error("[Copy Cleaner] Patch error:", e);
          throw e;
        }
      };
    }

    // Patch write (rich clipboard) — this is the big one for "Copy" buttons
    if (typeof clipboard.write === "function" && typeof ClipboardItem !== "undefined") {
      const origWrite = clipboard.write.bind(clipboard);
      clipboard.write = async (items) => {
        if (!isExtensionEnabled) {
          return await origWrite(items);
        }
        try {
          if (!Array.isArray(items)) return await origWrite(items);

          const cleanedItems = await Promise.all(items.map(async (it) => {
            // Only handle ClipboardItem-like objects with .types and .getType
            if (!it || !it.types || typeof it.getType !== "function") return it;

            const out = {};
            for (const type of it.types) {
              const blob = await it.getType(type);
              if (!blob || typeof blob.text !== "function") {
                out[type] = blob;
                continue;
              }

              if (type === "text/plain") {
                const txt = await blob.text();
                // Check for bypass marker
                if (txt.startsWith(BYPASS_MARKER)) {
                  out[type] = new Blob([txt.slice(BYPASS_MARKER.length)], { type });
                } else {
                  out[type] = new Blob([cleanCopiedText(txt)], { type });
                }
              } else if (type === "text/html") {
                // Convert to HTML from cleaned plain text (drop all links)
                const txt = await blob.text();
                out[type] = new Blob([toHtml(cleanCopiedText(txt))], { type });
              } else {
                // Preserve other types (images, etc.)
                out[type] = blob;
              }
            }

            return new ClipboardItem(out);
          }));

          if (showNotifications) {
            console.log("[Copy Cleaner] Clipboard write cleaned");
          }

          return await origWrite(cleanedItems);
        } catch (e) {
          console.error("[Copy Cleaner] Patch error:", e);
          throw e;
        }
      };
    }

    return { ok: true };
  }

  patchClipboard().then((res) => {
    try {
      window.dispatchEvent(new CustomEvent(HOOK_EVENT, { detail: res }));
    } catch (_) {
      // ignore
    }
  });
})();
