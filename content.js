(() => {
  "use strict";

  const browserAPI = typeof browser !== "undefined" ? browser : chrome;
  const storage = browserAPI.storage.sync || browserAPI.storage.local;

  const HOOK_EVENT = "__chatgpt_copy_cleaner_hooked__";

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
