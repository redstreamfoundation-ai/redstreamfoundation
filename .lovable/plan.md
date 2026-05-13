# Redstream Foundation — Landing Page Plan

A modern, premium, mobile-first landing page for an NGO emergency blood donor platform in Delhi. Humanitarian tech feel — calm, trustworthy, urgent.

## Design System

Update `src/styles.css` tokens (oklch):
- `--background`: pure white
- `--foreground`: near-black slate
- `--primary`: deep emergency red (~oklch(0.52 0.22 25))
- `--primary-glow`: brighter red for accents/pulses
- `--secondary` / `--muted`: soft warm gray sections
- `--accent`: subtle red-tinted surface
- Custom: `--gradient-emergency`, `--shadow-soft`, `--shadow-elevated`
- Radius: bumped to ~1rem for rounded cards
- Typography: Inter (body) + Instrument Serif or similar for headline accents (Google Fonts via link in `__root.tsx` head)

All components use semantic tokens — no hard-coded colors.

## Page Structure

Single route: `src/routes/index.tsx` replaces placeholder. Sections built as components in `src/components/landing/`:

1. **Nav** — minimal sticky header: logo mark (red droplet) + "Redstream", nav links, "Request Blood" CTA
2. **Hero** — Headline, subheadline, two CTAs (primary red "Request Blood", outline "Become a Donor"), animated live-activity pill (pulsing red dot + rotating mini status: "Donor matched in Lajpat Nagar · 2 min ago")
3. **ImpactMetrics** — 4 rounded stat cards: Active Donors, Lives Supported, Avg Response Time, Delhi Coverage Zones; subtle count-up animation on view
4. **HowItWorks** — 3-step vertical-on-mobile / horizontal-on-desktop flow with numbered circular badges and connecting line
5. **WhyRedstream** — Two-column (stacks on mobile): problem statement + intelligent-matching explanation, supporting iconography
6. **LiveActivityFeed** — Simulated feed card with rotating entries (donor matched, request fulfilled, donor en route), pulsing status dots, anonymized names + zones
7. **TrustVerification** — 3 cards: Verified Requests, Donor Privacy, NGO-Led Initiative
8. **EmergencyCTA** — Final urgent band with helpline number
9. **Footer** — Privacy Policy, Terms, Contact, Emergency Helpline (prominent), copyright

## Technical Notes

- Mobile-first Tailwind, scaling up at `md:` / `lg:`
- Animations via existing keyframes (`fade-in`, `scale-in`) plus a custom `pulse-ring` for live indicators
- Live activity uses local `useState` + `setInterval` rotating through a fixed array (no backend)
- SEO: route `head()` with title "Redstream Foundation — Emergency Blood Donors in Delhi", meta description, og tags
- Single H1 in Hero; semantic `<section>` with aria-labels
- No backend / Cloud needed — fully presentational

## File Changes

- `src/styles.css` — tokens, fonts, custom shadows/gradients, pulse-ring keyframe
- `src/routes/__root.tsx` — Google Fonts link, default meta polish
- `src/routes/index.tsx` — compose landing sections
- `src/components/landing/Nav.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/ImpactMetrics.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/WhyRedstream.tsx`
- `src/components/landing/LiveActivityFeed.tsx`
- `src/components/landing/TrustVerification.tsx`
- `src/components/landing/EmergencyCTA.tsx`
- `src/components/landing/Footer.tsx`

Switch preview to mobile viewport since the brief is mobile-first.
