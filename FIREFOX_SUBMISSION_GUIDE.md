# Firefox Add-ons Submission Guide

This guide walks you through submitting ChatGPT Copy Cleaner to Firefox Add-ons (AMO).

## Package Created ✅

Your extension has been packaged: **chatgpt-copy-cleaner-v1.0.0-firefox.zip** (27KB)

### Package Contents:
- manifest.json
- background.js, content.js, page_final.js
- popup.html, popup.css, popup.js
- icons/ (all 4 sizes)
- LICENSE
- README.md, CONTRIBUTING.md, code_of_conduct.md, CHANGELOG.md

---

## Step 1: Create Firefox Add-ons Account

1. Go to [https://addons.mozilla.org/](https://addons.mozilla.org/)
2. Click **Log in** (top right)
3. Create a Firefox Account or sign in with existing account
4. Verify your email address

---

## Step 2: Submit Your Extension

### 2.1 Start Submission
1. Go to [https://addons.mozilla.org/developers/](https://addons.mozilla.org/developers/)
2. Click **Submit a New Add-on**
3. Choose **On this site** (for listing on AMO)

### 2.2 Upload Your Extension
1. Click **Select a file...** or drag and drop
2. Upload: `chatgpt-copy-cleaner-v1.0.0-firefox.zip`
3. Wait for automatic validation (usually 30-60 seconds)
4. Fix any errors if shown (there shouldn't be any)

### 2.3 Select Platforms
- ✅ **Firefox for Desktop**
- ⬜ Firefox for Android (optional - test first)

---

## Step 3: Fill Out Add-on Details

### 3.1 Basic Information

**Name:**
```
ChatGPT Copy Cleaner
```

**Add-on URL (slug):**
```
chatgpt-copy-cleaner
```

**Summary:** (250 characters max)
```
Automatically removes citation links, reference markers, and tracking parameters when copying text from ChatGPT. Clean pastes every time with aggressive or conservative cleaning modes.
```

**Description:** (Use this)
```
# Clean Your ChatGPT Copies

Stop pasting cluttered text with citation markers, reference links, and tracking URLs. ChatGPT Copy Cleaner automatically removes all that noise before it reaches your clipboard.

## The Problem
When you copy text from ChatGPT, you often get:
- Citation markers like [1], [2]
- Reference links like ([MDN Docs][1])
- Reference definitions: [1]: https://example.com
- Tracking parameters: ?utm_source=chatgpt.com
- Source badges: "MDN Web Docs+1"

## The Solution
This extension intercepts copy actions and cleans the text automatically - whether you use Ctrl+C or ChatGPT's copy button.

## Features
✅ Automatic cleaning (no extra steps needed)
✅ Works with keyboard copy AND copy button
✅ Two cleaning modes:
   - Aggressive: Removes ALL links and URLs
   - Conservative: Keeps intentional links, removes citation noise
✅ Code block protection: Preserves URLs inside ``` and ` blocks
✅ Console notifications: Optional logging to DevTools
✅ Toast notifications: Visual feedback when cleaning is active
✅ Dark/light theme toggle

## How It Works
1. Go to chatgpt.com
2. Copy text from an assistant message (Ctrl+C or copy button)
3. Paste anywhere - citation noise is automatically removed
4. A green toast notification confirms the hook is active

## Privacy
- No data collection or tracking
- No analytics
- All processing happens locally in your browser
- Open source: https://github.com/adptly/chatgpt-copy-cleaner

## Browser Support
- Chrome 88+
- Edge 88+
- Firefox 109+
- Brave, Opera, Vivaldi
```

### 3.2 Categories
Select these categories:
- ✅ **Productivity**
- ✅ **Web Development** (optional)

### 3.3 Tags (Add these)
```
chatgpt, clipboard, copy, productivity, text-cleaning, citations
```

### 3.4 Support Information

**Support Email:**
```
code@adptly.com
```

**Support Website:**
```
https://github.com/adptly/chatgpt-copy-cleaner/issues
```

**Homepage:**
```
https://github.com/adptly/chatgpt-copy-cleaner
```

---

## Step 4: Upload Icons & Screenshots

### 4.1 Add-on Icon
- Upload: `icons/icon128.png` (already in your project)

### 4.2 Screenshots (IMPORTANT!)
Firefox requires at least **1 screenshot**. You need to:

1. **Load the extension in Firefox**
2. **Go to chatgpt.com**
3. **Take screenshots showing:**
   - Screenshot 1: Extension popup with settings
   - Screenshot 2: Copy operation with toast notification
   - Screenshot 3: Before/after comparison of copied text

**Screenshot specs:**
- Format: PNG or JPG
- Max size: 4MB each
- Recommended: 1280x800 or 1920x1080

---

## Step 5: Additional Information

### 5.1 License
Select: **MIT License**

### 5.2 Privacy Policy
**Is this required?** No (extension doesn't collect data)

If asked, you can add:
```
This extension does not collect, store, or transmit any user data. All text processing happens locally in your browser.
```

### 5.3 Version Notes (for v1.0.0)
```
Initial release featuring:
- Automatic removal of citation links and reference markers
- Support for both copy methods (Ctrl+C and copy button)
- Aggressive and conservative cleaning modes
- Code block protection
- Console notifications toggle
- Cross-browser compatibility
```

---

## Step 6: Distribution Options

### 6.1 Source Code
Firefox Add-ons requires reviewers to see your source code.

**Option 1: Link to GitHub (Recommended)**
```
https://github.com/adptly/chatgpt-copy-cleaner
```

**Option 2: Upload source as ZIP**
- Your submission ZIP already contains all source files
- Select: "The source code is included in the add-on package"

### 6.2 Build Instructions
Since there's no build process, add this note:
```
No build process required. This is a vanilla JavaScript extension with no dependencies or build tools. All source files are included as-is in the submission package.
```

---

## Step 7: Review & Submit

1. **Review all information** for accuracy
2. **Accept Mozilla's policies**:
   - Add-on Policies
   - Developer Agreement
3. Click **Submit Version** button

---

## Step 8: Wait for Review

### Timeline
- **Automated review:** Immediate (validation)
- **Human review:** 1-10 days (typically 2-5 days)
- **Listed on AMO:** Immediately after approval

### Review Status
Check status at: [https://addons.mozilla.org/developers/addons](https://addons.mozilla.org/developers/addons)

### What Reviewers Check
- ✅ Code quality and security
- ✅ Permissions match functionality
- ✅ No malicious code
- ✅ Works as described
- ✅ Follows AMO policies

---

## Step 9: After Approval

### You'll receive:
1. Email notification of approval
2. Public listing URL
3. Statistics dashboard access

### Next Steps:
1. **Share the link:** https://addons.mozilla.org/firefox/addon/chatgpt-copy-cleaner/
2. **Update README.md** with Firefox Add-ons badge
3. **Monitor reviews** and respond to users
4. **Track statistics** (downloads, users, ratings)

---

## Common Issues & Solutions

### Issue: Validation Errors
- **Solution:** Check manifest.json syntax, ensure all files are included

### Issue: Missing Permissions Justification
- **Solution:** Add a note explaining why you need `storage`, `scripting` permissions

### Issue: Review Delayed
- **Solution:** Be patient. Complex extensions take longer. Check inbox for reviewer questions.

### Issue: Screenshots Required
- **Solution:** You MUST add at least 1 screenshot before submission

---

## Need Help?

- **Firefox Add-ons Documentation:** https://extensionworkshop.com/
- **AMO Support:** https://developer.mozilla.org/docs/Mozilla/Add-ons
- **Your Repository:** https://github.com/adptly/chatgpt-copy-cleaner/issues

---

## Checklist Before Submitting

- [ ] Firefox account created and verified
- [ ] Extension ZIP uploaded and validated
- [ ] All required fields filled out
- [ ] At least 1 screenshot uploaded
- [ ] Support email/website provided
- [ ] License selected (MIT)
- [ ] Source code link provided (GitHub)
- [ ] Privacy policy noted (no data collection)
- [ ] Version notes added
- [ ] Reviewed all information for accuracy
- [ ] Accepted Mozilla policies
- [ ] Submitted!

---

Good luck with your submission! 🚀
