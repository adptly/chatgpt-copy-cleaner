# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it privately.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues by emailing:

📧 **code@adptly.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Next release cycle

### Our Commitment

- We will acknowledge your email within 48 hours
- We will keep you informed about the progress
- We will credit you in the fix (unless you prefer to remain anonymous)
- We will not take legal action against security researchers who:
  - Act in good faith
  - Do not access/modify user data
  - Report vulnerabilities responsibly

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices

This extension follows these security practices:

### Permissions
- **Minimal permissions:** Only requests `storage` and `scripting`
- **No network access:** Extension does not make network requests
- **No data collection:** No analytics, telemetry, or tracking

### Data Handling
- **Local processing only:** All text cleaning happens in the browser
- **No data transmission:** Nothing is sent to external servers
- **No data storage:** Only user preferences are stored locally

### Code Security
- **No eval():** No dynamic code execution
- **No external scripts:** All code is bundled in the extension
- **CSP compliant:** Follows Content Security Policy best practices
- **Open source:** Full source code is available for audit

## Known Issues

No known security issues at this time.

## Security Updates

Security updates will be published:
1. In this SECURITY.md file
2. In the [CHANGELOG.md](CHANGELOG.md)
3. In GitHub releases with `[SECURITY]` tag
4. Via Firefox/Chrome store update notifications

## Third-Party Dependencies

This extension has **zero dependencies**:
- Pure vanilla JavaScript
- No npm packages
- No external libraries
- No CDN resources

This eliminates supply chain attack vectors.

## Privacy Policy

This extension:
- ✅ Does NOT collect any user data
- ✅ Does NOT track user behavior
- ✅ Does NOT send data to external servers
- ✅ Does NOT use analytics or telemetry
- ✅ Only stores user preferences locally (cleaning mode, theme, etc.)

For more details, see the [Privacy](#privacy) section in README.md.

## Security Audit History

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2025-01-07 | Internal | No issues | ✅ Clean |

## Contact

For security concerns: **code@adptly.com**

For general support: [GitHub Issues](https://github.com/adptly/chatgpt-copy-cleaner/issues)
