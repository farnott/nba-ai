# NBA AI — Project Documentation

## Overview
Landing page for Northumberland Business Automation's AI phone answering and live chat service.
- **Live site:** https://nba-ai.co.uk
- **Staging:** https://nba-website.pages.dev

---

## Hosting — Cloudflare Pages
- Provider: Cloudflare Pages (free tier)
- Deploy method: Drag and drop folder to Cloudflare Pages
- Project name: `nba-website`
- Files to upload: `index.html`, `thank-you.html`, `cancelled.html` (no functions folder needed)

### To update the site:
1. Edit the relevant HTML file
2. Go to Cloudflare → Workers & Pages → nba-website → Deployments
3. Drag the folder containing all three HTML files to redeploy

---

## Stripe Checkout — Cloudflare Worker
The checkout button calls a Cloudflare Worker which creates a Stripe session.

- **Worker name:** young-scene-81d8
- **Worker URL:** https://young-scene-81d8.flemming-654.workers.dev/
- **Worker file:** stripe-worker.js

### How the checkout works:
1. Visitor clicks "Start for just £1 today"
2. Button calls the Cloudflare Worker via POST
3. Worker creates a Stripe Checkout session with a £138 off coupon (bringing £139 down to £1 for first month)
4. Visitor is redirected to Stripe hosted checkout
5. On success, redirected to /thank-you.html
6. On cancel, redirected to /cancelled.html

### Stripe products:
- **Live £139/month price ID:** price_1TacHZLeyxKK4UQn1DkzlBD4
- **Test £139/month price ID:** (stored in Worker env variable STRIPE_TEST_PRICE_ID)
- **Live coupon ID:** FIRST_MONTH_1GBP (£138 off, first invoice only)
- **Test coupon ID:** TEST_FIRST_MONTH_1GBP (auto-created by Worker)

---

## Worker Environment Variables
Set in Cloudflare → Workers & Pages → young-scene-81d8 → Settings → Variables and Secrets

| Variable | Type | Value |
|----------|------|-------|
| `MODE` | Plaintext | `live` or `test` |
| `DOMAIN` | Plaintext | https://nba-ai.co.uk |
| `STRIPE_LIVE_SECRET_KEY` | Secret | sk_live_... |
| `STRIPE_TEST_SECRET_KEY` | Plaintext | sk_test_... |
| `STRIPE_LIVE_PRICE_ID` | Plaintext | price_1TacHZLeyxKK4UQn1DkzlBD4 |
| `STRIPE_TEST_PRICE_ID` | Plaintext | price_... (test mode price) |

### To switch between live and test mode:
1. Go to Cloudflare → Workers & Pages → young-scene-81d8 → Settings → Variables and Secrets
2. Edit `MODE` — set to `live` or `test`
3. Save — takes effect immediately, no redeploy needed

### Test card details (Stripe test mode only):
- Card: 4242 4242 4242 4242
- Expiry: 12/34
- CVC: 123
- Postcode: any

---

## DNS — Cloudflare
DNS is managed by Cloudflare (nameservers transferred from Fasthosts).
- Nameservers: brynne.ns.cloudflare.com / terin.ns.cloudflare.com
- Domain registered at: Fasthosts

### DNS Records:
| Type | Name | Content |
|------|------|---------|
| CNAME | nba-ai.co.uk | nba-website.pages.dev (Proxied) |
| MX | nba-ai.co.uk | Cloudflare email routing |
| TXT | nba-ai.co.uk | SPF record for email |

---

## Email
- **Receiving:** john@nba-ai.co.uk forwards to personal Gmail via Cloudflare Email Routing
- **Sending:** Set up in Gmail → Settings → Accounts and Import → Send mail as
- Uses Gmail SMTP (smtp.gmail.com) with App Password
- In Gmail, select john@nba-ai.co.uk from the From dropdown when composing

---

## Related Sites
### chrisberry.org.uk / chrisberrydescription.co.uk
- Hosted on cPanel server (cberry.myzen.co.uk)
- Two WordPress installs — main site at root, second at /chrisberryad/
- chrisberrydescription.co.uk redirects to chrisberry.org.uk/chrisberryad/ via .htaccess
- .htaccess redirect rules must be placed ABOVE WordPress rules to work

### directresponsept.com (WP Engine)
- WordPress site on WP Engine
- Has Stripe Trial Checkout plugin installed
- Plugin file: wp-content/plugins/stripe-trial-checkout/stripe-trial-checkout.php
- Uses same Stripe account as NBA AI

---

## File Structure
```
nba-website-cloudflare/
├── index.html          (main landing page)
├── thank-you.html      (post-payment success page)
├── cancelled.html      (cancelled checkout page)
└── stripe-worker.js    (Cloudflare Worker — deploy separately, not in Pages)
```

---

## To Do
- [ ] Record and embed demo video in index.html
- [ ] Add AI chat widget to site
- [ ] Design logo/wordmark
- [ ] Set up GHL integration
- [ ] Run Lighthouse audit on live domain

---

## Colour Palette & Design
- Background: #0a0a0f (near black)
- Accent: #00e5a0 (teal/green)
- Text: #ffffff
- Muted text: rgba(255,255,255,0.7)
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- Design style: Dark, premium, minimal

---
*Last updated: May 2026*
