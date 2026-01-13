# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-12

### Added
- **Click interception layer**: New `composedPath()`-based detection for copy button clicks
  - Survives DOM structure changes (shadow DOM, portals, `<div role="button">`)
  - More reliable than clipboard patching in Firefox
- **Multi-line reference block stripper**: Handles wrapped/split reference definitions
  - Uses line-scanner approach instead of single-line regex
  - Strips trailing reference blocks from bottom up
- **Smart code block detection**: Distinguishes code block copy buttons from message copy buttons
  - Code block copies pass through unchanged (no cleaning)
  - Message copies are cleaned normally
- **Bypass marker system**: Prevents double-cleaning when multiple layers succeed

### Changed
- Refactored to 3-layer defense-in-depth architecture:
  - Layer 1: Selection copy (content script, `copy` event)
  - Layer 2: Click interception (content script, `composedPath()`)
  - Layer 3: Clipboard API patch (page world, fallback)
- Improved Firefox reliability by prioritizing DOM-based interception over clipboard patching

### Fixed
- Multi-line reference definitions now properly stripped (previously only single-line worked)
- Code block copy buttons no longer clean code content

---

## [1.0.0] - 2025-01-07

### Added
- Initial release of ChatGPT Copy Cleaner
- Automatic cleaning of citation links, reference markers, and tracking parameters
- Support for both copy methods:
  - Ctrl/Cmd+C (keyboard selection)
  - ChatGPT's copy button (clipboard API hook)
- Cross-browser support (Chrome, Firefox, Edge, Brave, Opera)
- Settings popup with modern UI
- **Aggressive mode**: Removes ALL links, URLs, citations, and reference markers
- **Conservative mode**: Keeps intentional inline links, removes citation noise only
- **Code block protection**: Preserves URLs inside ``` and ` code blocks
- **Console notifications**: Optional logging of cleaning activity to DevTools
- Toast notifications for visual feedback
- Robust clipboard API patching for MAIN world injection
- Background script for CSP-compliant script injection
- Dark/light theme toggle in popup
- MIT License
- Complete documentation (README, CONTRIBUTING, Code of Conduct)

### Changed
- Nothing (initial release)

### Deprecated
- Nothing

### Removed
- Nothing

### Fixed
- Nothing

### Security
- No security vulnerabilities identified

---

## How to Update

For users with the extension already installed:

1. **Chrome/Edge/Brave**: Go to `chrome://extensions`, find "ChatGPT Copy Cleaner", and click the refresh icon
2. **Firefox**: Go to `about:debugging#/runtime/this-firefox`, find the extension, and click "Reload"

Or download the latest version and reinstall the extension.

---

## Release Notes Format

Each release will document:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features that have been removed
- **Fixed**: Bug fixes
- **Security**: Security patches

[1.1.0]: https://github.com/adptly/chatgpt-copy-cleaner/releases/tag/v1.1.0
[1.0.0]: https://github.com/adptly/chatgpt-copy-cleaner/releases/tag/v1.0.0
