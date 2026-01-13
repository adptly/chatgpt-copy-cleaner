(() => {
  "use strict";

  const browserAPI = typeof browser !== "undefined" ? browser : chrome;
  const storage = browserAPI.storage.sync || browserAPI.storage.local;

  const HOOK_EVENT = "__chatgpt_copy_cleaner_hooked__";
  const BYPASS_MARKER = "\x00__COPY_CLEANER_BYPASS__\x00";

  // Local cache of settings
  let isEnabled = true;
  let cleaningMode = "aggressive";
  let protectCodeBlocks = true;
  let showNotifications = true;

  // --- State Management ---

  /**
   * Dispatches the current settings to the main-world script via postMessage.
   */
  function dispatchStateUpdate() {
    window.postMessage({
      type: 'CLEANER_STATE_UPDATE',
      payload: {
        enabled: isEnabled,
        mode: cleaningMode,
        protectCodeBlocks: protectCodeBlocks,
        showNotifications: showNotifications
      }
    }, window.location.origin);
  }

  // 1. Load initial settings from storage.
  storage.get({
    enabled: true,
    mode: "aggressive",
    protectCodeBlocks: true,
    showNotifications: true
  }, (settings) => {
    isEnabled = settings.enabled;
    cleaningMode = settings.mode;
    protectCodeBlocks = settings.protectCodeBlocks;
    showNotifications = settings.showNotifications;
    // Dispatch state immediately, and again after hook confirmation for robustness.
    dispatchStateUpdate();
  });

  // 2. Listen for changes from the popup's settings.
  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area.startsWith("sync") || area.startsWith("local")) {
      if (changes.enabled) {
        isEnabled = changes.enabled.newValue;
      }
      if (changes.mode) {
        cleaningMode = changes.mode.newValue;
      }
      if (changes.protectCodeBlocks) {
        protectCodeBlocks = changes.protectCodeBlocks.newValue;
      }
      if (changes.showNotifications) {
        showNotifications = changes.showNotifications.newValue;
      }
      dispatchStateUpdate();
    }
  });


  // --- Cleaner logic (for selection copy) ---

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
    t = t.replace(/\s*cite[^]+/g, "");
    t = t.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, "");
    t = t.replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, "$1");
    t = t.replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1");
    t = t.replace(/\s*\(\[[^\]]+\]\[[^\]]+\]\)\s*(?:<-+.*)?/g, "");
    t = t.replace(/\s*\[[^\]]+\]/g, "");
    t = t.replace(/<https?:\/\/[^>]+>/gi, "");
    t = t.replace(/\bhttps?:\/\/\S+/gi, "");
    t = t.replace(/\bwww\.\S+/gi, "");
    t = t.replace(/(^|\s)[A-Z][A-Za-z0-9 .,&/\\-]{2,80}\+\d+\b/g, "$1");
    t = t.replace(/\(\s*\)/g, "");
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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toHtml(text) {
    const esc = escapeHtml(text);
    return `<div style="white-space:pre-wrap;font-family:inherit;">${esc}</div>`;
  }

  // --- Selection copy (Ctrl/Cmd-C) Handler ---
  function closestElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function selectionIsInAssistant(sel) {
    if (!sel || sel.isCollapsed) return false;
    const selector = '[data-message-author-role="assistant"]';
    const a = closestElement(sel.anchorNode)?.closest?.(selector);
    const f = closestElement(sel.focusNode)?.closest?.(selector);
    return Boolean(a || f);
  }

  document.addEventListener(
    "copy",
    (e) => {
      // Respect the enabled/disabled state for selection copy too.
      if (!isEnabled) return;

      const sel = window.getSelection?.();
      if (!sel || sel.isCollapsed) return;
      if (!selectionIsInAssistant(sel)) return;

      const raw = sel.toString();
      const cleaned = cleanCopiedText(raw);
      if (!cleaned || cleaned === raw) return;

      if (showNotifications) {
        console.log("[Copy Cleaner] Selection copy cleaned");
      }

      e.clipboardData.setData("text/plain", cleaned);
      e.clipboardData.setData("text/html", toHtml(cleaned));
      e.preventDefault();
    },
    true
  );

  // --- Copy Button Click Interception (composedPath-based, DOM-resilient) ---

  /**
   * Find a "copy intent" element in the click's composed path.
   * Handles shadow DOM, portals, and non-button clickable elements.
   */
  function findCopyIntentInPath(e) {
    const path = e.composedPath?.() || [];
    for (const n of path) {
      if (!(n instanceof HTMLElement)) continue;
      const aria = (n.getAttribute("aria-label") || "").toLowerCase();
      const title = (n.getAttribute("title") || "").toLowerCase();
      const testid = (n.getAttribute("data-testid") || "").toLowerCase();

      const looksCopy = aria.includes("copy") || title.includes("copy") || testid.includes("copy");
      if (!looksCopy) continue;

      // Accept button, role="button", or clickable div/span
      if (n.matches("button, [role='button'], div, span")) return n;
    }
    return null;
  }

  /**
   * Find the assistant message container from the click's composed path.
   */
  function findAssistantContainerFromPath(e) {
    const path = e.composedPath?.() || [];
    for (const n of path) {
      if (!(n instanceof HTMLElement)) continue;
      if (n.getAttribute?.("data-message-author-role") === "assistant") return n;
    }
    return null;
  }

  /**
   * Extract message text from an assistant container.
   * If copyElement is inside a code block, returns just that code.
   * Otherwise returns the full message content.
   */
  function getMessageText(container, copyElement) {
    if (!container) return null;

    // Check if copy button is for a specific code block
    if (copyElement) {
      const codeBlock = copyElement.closest('pre, [class*="code-block"], [class*="codeblock"]');
      if (codeBlock) {
        const code = codeBlock.querySelector('code');
        // Return code content without cleaning (it's code, should be preserved)
        return { text: code?.textContent || codeBlock.textContent, isCode: true };
      }
    }

    // Fall back to full message
    const markdownDiv = container.querySelector(".markdown, .prose, [class*='markdown']");
    const text = markdownDiv?.innerText || container.innerText;
    return { text, isCode: false };
  }

  // Capture-phase click handler for copy button interception
  document.addEventListener(
    "click",
    (e) => {
      if (!isEnabled) return;

      const copyEl = findCopyIntentInPath(e);
      if (!copyEl) return;

      const assistantContainer = findAssistantContainerFromPath(e);
      if (!assistantContainer) return;

      const result = getMessageText(assistantContainer, copyEl);
      if (!result || !result.text) return;

      // Skip cleaning for code blocks (preserve code as-is)
      const textToCopy = result.isCode ? result.text : cleanCopiedText(result.text);
      if (!textToCopy) return;

      // Write to clipboard (we're in a user gesture context)
      // Prefix with marker so main-world patch knows to skip re-cleaning
      const markedText = BYPASS_MARKER + textToCopy;

      navigator.clipboard.writeText(markedText).then(() => {
        if (showNotifications) {
          const msg = result.isCode ? "Code copied" : "Copied (cleaned)";
          console.log(`[Copy Cleaner] ${msg}`);
          showToast(msg, true);
        }
      }).catch((err) => {
        console.warn("[Copy Cleaner] Clipboard write failed:", err);
        // Let the original click proceed if our write fails
        return;
      });

      // Prevent the original copy action
      e.stopPropagation();
      e.preventDefault();
    },
    true // capture phase
  );

  // --- UI Feedback (Toast) ---
  function showToast(msg, ok = true) {
    // Only show toast if notifications are enabled
    if (!showNotifications) return;

    try {
      const id = "__chatgpt_copy_cleaner_toast__";
      document.getElementById(id)?.remove();
      const el = document.createElement("div");
      el.id = id;
      el.textContent = msg;
      Object.assign(el.style, {
        position: "fixed",
        zIndex: "999999",
        top: "12px",
        right: "12px",
        padding: "10px 12px",
        borderRadius: "10px",
        font: "12px/1.2 system-ui, -apple-system, Segoe UI, Roboto",
        background: ok ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
        color: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        maxWidth: "280px",
      });
      document.documentElement.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    } catch (_) {}
  }

  // --- Trigger background script injection and listen for confirmation ---

  // 1. Listen for the confirmation event from the injected script
  window.addEventListener(HOOK_EVENT, (e) => {
    if (e.detail?.ok) {
      if (showNotifications) {
        console.log("[Copy Cleaner] Main-world script hook confirmed.");
      }
      showToast("Copy Cleaner: hook active", true);
      // The hook is now active, so we ensure it has the latest state.
      dispatchStateUpdate();
    } else {
      console.error("[Copy Cleaner] Main-world script failed to hook:", e.detail);
      showToast("Copy Cleaner: hook failed (see console)", false);
    }
  });

  // 2. Send a message to the background script to trigger the injection
  browserAPI.runtime.sendMessage({ type: 'inject_script' }, (response) => {
    if (browserAPI.runtime.lastError) {
      console.error("[Copy Cleaner] Injection trigger failed:", browserAPI.runtime.lastError.message);
      showToast("Copy Cleaner: hook failed (runtime error)", false);
    } else if (!response?.success) {
      console.error("[Copy Cleaner] Injection failed in background script:", response?.error);
      showToast("Copy Cleaner: hook blocked (injection failed)", false);
    }
    // If successful, we wait for the HOOK_EVENT to show the success toast.
  });

})();
