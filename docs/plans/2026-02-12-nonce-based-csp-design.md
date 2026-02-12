# Nonce-Based CSP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `'unsafe-inline'` CSP with nonce-based `'strict-dynamic'` CSP to fix Lighthouse Best Practices score.

**Architecture:** Middleware generates a per-request nonce, sets CSP header with that nonce, and passes it to the layout via a custom request header. Layout reads the nonce and applies it to all inline scripts and `next/script` tags.

**Tech Stack:** Next.js 16 middleware, `crypto.randomUUID()`, `headers()` from `next/headers`

---

### Task 1: Create middleware with nonce generation and CSP header

**Files:**
- Create: `middleware.ts`

**Step 1: Create the middleware**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    { source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)" },
  ],
};
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "add middleware with nonce-based CSP header"
```

---

### Task 2: Remove CSP from next.config.ts static headers

**Files:**
- Modify: `next.config.ts`

**Step 1: Remove CSP entry from headers array**

Remove the `Content-Security-Policy` header object from the headers array. Keep all other security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security`).

**Step 2: Commit**

```bash
git add next.config.ts
git commit -m "remove static CSP header, now handled by middleware"
```

---

### Task 3: Update layout.tsx to use nonce on all scripts

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Make layout async, read nonce from headers**

Convert `RootLayout` to `async function`. Import `headers` from `next/headers`. Read the nonce:

```typescript
import { headers } from "next/headers";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? "";
  // ...
```

**Step 2: Apply nonce to the theme detection inline script**

Change the theme script from `dangerouslySetInnerHTML` to include nonce:

```tsx
<script
  nonce={nonce}
  dangerouslySetInnerHTML={{
    __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")})()`,
  }}
/>
```

**Step 3: Apply nonce to Google Analytics `<Script>` tags**

```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-H4VK7HXVHV"
  strategy="lazyOnload"
  nonce={nonce}
/>
<Script id="gtag-init" strategy="lazyOnload" nonce={nonce}>
  {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-H4VK7HXVHV');`}
</Script>
```

Note: `type="application/ld+json"` script does NOT need a nonce (exempt from CSP).

**Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "apply nonce to all inline and external scripts in layout"
```

---

### Task 4: Verify build succeeds

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 2: Run tests**

Run: `npm test`
Expected: All pass

**Step 3: Run dev server and verify in browser**

Run: `npm run dev`
- Open http://localhost:3000
- Check browser console for CSP violations
- Verify theme toggle, chat, document browser all work
- Verify Google Analytics loads (check Network tab)
