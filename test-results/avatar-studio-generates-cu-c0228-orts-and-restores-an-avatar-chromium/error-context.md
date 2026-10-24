# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: avatar-studio.spec.ts >> generates, customizes, exports, and restores an avatar
- Location: e2e/avatar-studio.spec.ts:27:5

# Error details

```
Error: page.waitForEvent: Target page, context or browser has been closed
=========================== logs ===========================
waiting for event "download"
============================================================
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: /^Download WebP/ })

```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```