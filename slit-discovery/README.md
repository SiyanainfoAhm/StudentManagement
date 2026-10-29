# SLIT Student Discovery POC (isolated)

Open `/slit-discovery/index.html` through a deployed HTTPS origin. This is a standalone static browser test, not wired into the existing app or Supabase.

## Setup
1. In Google Cloud, enable Gmail API and Drive API.
2. Configure OAuth consent and add test users. Request Gmail readonly and Drive readonly scopes; Google's verification and security assessment may be required for production.
3. Create OAuth Web client, add the deployment's HTTPS origin.
4. Replace REPLACE_WITH_GOOGLE_WEB_CLIENT_ID in index.html with the public OAuth client ID (never a client secret).
5. Host the directory at an HTTPS URL. Test consent and candidate discovery.

## Boundaries
- No WhatsApp sending, backend, OCR, attachment download, AI classification or Supabase upload.
- Searches up to 100 Drive files and 50 Gmail messages. Does not paginate, so not exhaustive.
- Gmail search uses subjects; Drive search uses filenames. No document contents read.
- The selection checkboxes are review-only and do not submit anything.
- Tokens remain in browser memory; disconnect revokes token and clears displayed results.
- Existing StudentManagement authentication is NOT suitable for sensitive documents; implement secure server sessions, RLS, expiring invitation tokens and private storage before production.
