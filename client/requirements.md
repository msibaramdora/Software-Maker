## Packages
framer-motion | Smooth page transitions and micro-interactions
qrcode.react | Generating QR codes for visitor passes
html5-qrcode | Scanning QR codes from the browser
react-dropzone | Drag and drop file uploads for visitor photos
date-fns | Date formatting

## Notes
Global auth state should be handled via a context provider that checks /api/user on mount.
Visitor photos will be handled as base64 strings for simplicity in this lite build.
QR Codes will encode the visit ID directly for easy lookup.
