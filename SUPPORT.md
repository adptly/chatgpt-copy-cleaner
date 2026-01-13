# Support

Thank you for using ChatGPT Copy Cleaner! Here's how to get help.

## Documentation

First, check our documentation:

- **README:** [README.md](README.md) - Installation, features, and usage
- **FAQ:** See [Troubleshooting](#troubleshooting) section below
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup
- **Changelog:** [CHANGELOG.md](CHANGELOG.md) - Version history

## Getting Help

### Questions & Discussions

For general questions, feature ideas, or discussions:

1. Check if your question is answered in the [Troubleshooting](#troubleshooting) section
2. Search [existing issues](https://github.com/adptly/chatgpt-copy-cleaner/issues) to see if someone already asked
3. Start a [GitHub Discussion](https://github.com/adptly/chatgpt-copy-cleaner/discussions)
4. Email us at **code@adptly.com** for direct support

### Bug Reports

Found a bug? Please:

1. Check [existing issues](https://github.com/adptly/chatgpt-copy-cleaner/issues) for duplicates
2. Use our [Bug Report Template](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=bug_report.md)
3. Include browser version, OS, and steps to reproduce

### Feature Requests

Have an idea? Please:

1. Check [existing feature requests](https://github.com/adptly/chatgpt-copy-cleaner/issues?q=is%3Aissue+label%3Aenhancement)
2. Use our [Feature Request Template](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=feature_request.md)
3. Describe the problem it solves and your use case

### Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email **code@adptly.com** or see [SECURITY.md](SECURITY.md) for details.

---

## Troubleshooting

### Extension Not Working

**Problem:** Extension doesn't seem to do anything

**Solutions:**
1. Check that you're on chatgpt.com or chat.openai.com
2. Reload the page (Ctrl+R or Cmd+R)
3. Check that the extension is enabled in your browser's extension manager
4. Look for errors in the browser console (F12 → Console)

---

### Copy Button Not Cleaning

**Problem:** Clicking ChatGPT's copy button doesn't clean the text

**Solutions:**
1. Check the browser console for `[Copy Cleaner]` messages
2. If you see "hook blocked", try disabling other extensions temporarily
3. Try using Ctrl+C (selection copy) as a fallback
4. Make sure the extension is enabled in the popup

---

### Toast Notification Not Appearing

**Problem:** No green success notification shows up

**Solutions:**
1. Open the extension popup and check if "Console notifications" is enabled
2. Notifications won't show if the extension isn't enabled
3. Reload the ChatGPT page
4. Check if another extension is blocking toasts

---

### Settings Not Saving

**Problem:** Settings reset when I close the browser

**Solutions:**
1. Check browser storage permissions for the extension
2. Firefox: Make sure you're not in Private Browsing mode (or enable extension in private mode)
3. Chrome: Check if "Clear cookies and site data when you close all windows" is enabled
4. Try reinstalling the extension

---

### Wrong Text Being Cleaned

**Problem:** Extension cleans text from non-ChatGPT messages

**Solutions:**
- This shouldn't happen - the extension only works on messages with `data-message-author-role="assistant"`
- Please [report this as a bug](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=bug_report.md) with examples

---

### Code Blocks Being Cleaned

**Problem:** URLs inside code blocks are being removed

**Solutions:**
1. Open the extension popup
2. Enable "Protect code blocks" toggle
3. Try copying again

---

### Code Block Copy Button Not Working

**Problem:** Clicking the copy button on a code block doesn't copy the code

**Solutions:**
- Code block copy buttons should pass through unchanged (no cleaning applied)
- If code is being cleaned, please [report as a bug](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=bug_report.md)
- Try using Ctrl+C to select and copy the code directly

---

### Reference Links Still Appearing

**Problem:** Multi-line reference definitions at the bottom of copied text aren't being removed

**Solutions:**
1. Update to version 1.1.0 or later (includes multi-line reference stripper)
2. Check if the references are in an unusual format
3. [Report as a bug](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=bug_report.md) with an example of the text

---

### Extension Conflicts

**Problem:** Extension conflicts with other extensions

**Solutions:**
1. Try disabling other clipboard/copy-related extensions temporarily
2. Report the conflict [as an issue](https://github.com/adptly/chatgpt-copy-cleaner/issues/new?template=bug_report.md) with the conflicting extension name
3. We'll work on compatibility

---

## Browser-Specific Issues

### Firefox

- Make sure you're on Firefox 142 or later
- If the extension doesn't load, check `about:debugging` for errors
- For temporary installations, you need to reload after each browser restart

### Chrome / Edge

- Make sure you're on Chrome/Edge 88 or later
- Check `chrome://extensions` (or `edge://extensions`) for errors
- Make sure "Developer mode" is enabled if you're loading unpacked

---

## Still Need Help?

If you've tried the above and still have issues:

1. **Email:** code@adptly.com
2. **GitHub Issues:** [Report a problem](https://github.com/adptly/chatgpt-copy-cleaner/issues/new/choose)
3. **Discussions:** [Ask the community](https://github.com/adptly/chatgpt-copy-cleaner/discussions)

Please include:
- Browser name and version
- Operating system
- Extension version
- Steps to reproduce the issue
- Console errors (if any)
- Screenshots (if relevant)

---

## Contributing

Want to help improve the extension? See [CONTRIBUTING.md](CONTRIBUTING.md)!

We appreciate bug reports, feature suggestions, code contributions, and documentation improvements.

---

Thank you for using ChatGPT Copy Cleaner! 🎉
