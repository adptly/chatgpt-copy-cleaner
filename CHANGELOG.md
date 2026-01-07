# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/adptly/chatgpt-copy-cleaner/releases/tag/v1.0.0
