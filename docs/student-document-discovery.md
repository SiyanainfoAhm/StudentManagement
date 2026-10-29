# Student document discovery (prototype)

Route: `/student-documents`

This prototype uses Google Identity Services OAuth in the browser to request `https://www.googleapis.com/auth/drive.metadata.readonly`. It lists up to 1,000 matching Google Drive files, classifies by filename/description, and lets the student review suggested matches. It does **not** download, inspect file contents, scan Gmail, or upload anything. The phone file picker selects local files only. Do not use this as a production collection portal.

## Configure

1. Create or select a Google Cloud project and configure OAuth consent screen, privacy policy, authorised domains, and any required app verification.
2. Enable Google Drive API.
3. Create an OAuth **Web application** client, and register the exact deployed HTTPS origin under **Authorized JavaScript origins** (and localhost development origin if needed).
4. Set `VITE_GOOGLE_CLIENT_ID=<web-client-id>` in deployment environment; never use a client secret in Vite/browser code.
5. Deploy this branch to HTTPS, then open `/student-documents`. Google account consent will appear when the user clicks the connect button.

## Before production

- Add secure, expiring student-specific invitation tokens with server-side validation and rate limiting.
- Add explicit purpose-specific privacy notices, retention/deletion policy and audit logs.
- Implement a server-side secure submission endpoint and private storage with strict student/college access control.
- For content-based classification, separately request appropriate scopes, build secure server-side processing, and obtain any required Google verification.
- Gmail discovery requires a separate OAuth scope and review; do not imply it is already available.
- Never automatically upload or share discovered files; require explicit per-file confirmation.
