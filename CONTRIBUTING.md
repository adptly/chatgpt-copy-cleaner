# Contributing to ChatGPT Copy Cleaner

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

No build tools are required. To test your changes:

1. Load the extension in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions`, enable Developer mode, click "Load unpacked", select the project folder
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select `manifest.json`

2. Make changes to the code

3. Reload the extension:
   - **Chrome/Edge**: Click the refresh icon on the extension card
   - **Firefox**: Click "Reload" button

4. Test on [chatgpt.com](https://chatgpt.com)

## Code Style

- Use ES6+ JavaScript
- 2-space indentation
- Semicolons required
- Use `const` and `let`, avoid `var`
- Prefer template literals over string concatenation
- Add JSDoc comments for functions
- Keep functions small and focused

## Testing

Manual testing checklist:

- [ ] Extension loads without errors in both Chrome and Firefox
- [ ] Copy using Ctrl+C cleans text correctly
- [ ] Copy button click cleans text correctly
- [ ] Settings popup opens and saves changes
- [ ] All toggle switches work as expected
- [ ] Aggressive mode removes all links
- [ ] Conservative mode preserves inline links
- [ ] Code block protection works for ``` and ` blocks in message text
- [ ] Code block copy buttons pass through unchanged (no cleaning)
- [ ] Multi-line reference blocks are properly stripped
- [ ] Console notifications toggle works
- [ ] Toast notifications appear when enabled

## Architecture Overview

The extension uses a 3-layer defense-in-depth strategy:

1. **Layer 1 - Selection Copy** (`content.js`): Handles Ctrl/Cmd+C via `copy` event
2. **Layer 2 - Click Interception** (`content.js`): Uses `composedPath()` for DOM-resilient copy button detection
3. **Layer 3 - Clipboard Patch** (`page_final.js`): Patches clipboard API in page world as fallback

When modifying the cleaning logic, update both `content.js` and `page_final.js` to keep them in sync.

## Pull Request Guidelines

- Keep PRs focused on a single feature or bugfix
- Write clear commit messages
- Update README.md if you add new features
- Test on both Chrome and Firefox if possible
- Reference any related issues

### Commit Message Format

```
feat: Add new feature
fix: Fix bug description
docs: Update documentation
style: Format code
refactor: Refactor code structure
test: Add or update tests
```

## Reporting Issues

When reporting issues, please include:

- Browser name and version
- Extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues first
- Explain the use case
- Describe the expected behavior
- Consider backwards compatibility

## Code of Conduct

Be respectful and professional in all interactions. We're all here to learn and improve the project together.

## Questions?

Feel free to open an issue for any questions about contributing, or email us at code@adptly.com.
