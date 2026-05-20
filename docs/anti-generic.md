POLICY: Anti-Generic UI/UX Design Enforcement
Version: 2.0 — Code-Level Specifics

Core premise: AI-generated UI has distinct, identifiable "tells." This policy names each one precisely with bad/good code examples and enforces their elimination.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FORBIDDEN: Nested / Double-Layer Card Anti-Pattern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pattern: A card component wrapping another card-like div — both with similar
background colors and borders, creating a "double layer" with no visual hierarchy.

BAD (generic AI output):
  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
    <div className="rounded-lg bg-gray-100 border border-gray-200 p-3">
      <p>Content</p>
    </div>
  </div>
  Problem: Two nested surfaces with nearly identical backgrounds/borders = noise.

GOOD:
  <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm p-5">
    <pre className="rounded-lg bg-[#f8f9fa] border border-[#efefef] p-4 text-sm font-mono">
      Content
    </pre>
  </div>
  Rule: Inner element must have a clearly distinct surface (code block, media, tinted block).
  Never nest a "card" inside a "card" unless the inner element is a fundamentally
  different content type (code, image, table).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. FORBIDDEN: Same-Tone Background + Border (The Invisible Border)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pattern: A soft background (bg-gray-50, bg-slate-50) paired with a border of
nearly the same lightness (border-gray-100). The border adds markup but zero visual
structure because there is no contrast.

BAD:
  bg-slate-50 + border-slate-100    (delta < 5% lightness)
  bg-neutral-50 + border-neutral-100
  bg-blue-50 + border-blue-100 on a badge

GOOD — profile/avatar card pattern:
  <div className="bg-white border border-[#d1d5db] rounded-2xl shadow-sm">
  The border (#d1d5db) is visibly darker than white — it defines the edge.

GOOD — badge pattern:
  <span className="bg-blue-50 border border-blue-300 text-blue-800 rounded-full px-2.5 py-0.5 text-xs font-medium">
  Not border-blue-100. The border must be at least 2 Tailwind steps darker than the bg.

Rule: border color lightness must be at least 10% darker than background color.
Every border must be visible without squinting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. FORBIDDEN: Emoji Icons in UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pattern: Using emoji (🛡️ ✅ 📊 🔧 ⚡ 🎨) in place of proper icon components.

Why it fails:
  - Renders differently on every OS (Apple vs Google vs Windows glyphs are distinct shapes)
  - Cannot be styled with CSS (no color change, opacity, or stroke control)
  - Screen readers announce the emoji's Unicode name, not its UI intent
  - Breaks visual consistency with the rest of the design system

BAD:
  <span>🛡️ Security</span>
  <button>✅ Confirm</button>

GOOD:
  import { ShieldCheck } from "lucide-react"
  <ShieldCheck className="size-4 text-emerald-500" />

Use Lucide, Heroicons, or Radix Icons. If no direct match exists, use an abstract
geometric metaphor or a closely related icon. Never fall back to emoji.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. FORBIDDEN: Em Dashes in Interface Copy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pattern: Using — (em dash U+2014) inside UI labels, card titles, button text,
badge labels, or any rendered interface element.

Em dashes belong in editorial prose. In UI they create rhythm confusion and
screen reader ambiguity (announced as "dash" or skipped entirely).

BAD:
  "Status — Active"
  "Plan — Pro Tier"
  "Results — 12 found"

GOOD:
  <span className="text-sm text-muted-foreground">Status</span>
  <span className="text-sm font-semibold text-foreground">Active</span>
  // Or use a colon: "Status: Active"
  // Or use a separator divider element, never text punctuation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. FORBIDDEN: Generic Color Abuse and Rainbow Syndrome
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI-generated color problems, ranked by frequency:

A. Rainbow / multi-hue card grids:
   BAD: Cards cycling blue, purple, green, red, orange for category colors.
   Result: No art direction. Looks like a default Bootstrap demo.
   GOOD: Use one brand hue in varying lightness steps. If color-coding is required,
   limit to 3 semantic hues (brand, success-green, danger-red) and one neutral.

B. Generic purple as "modern tech" default:
   BAD: #7C3AED / violet-600 chosen with no reasoning simply because it "reads tech."
   GOOD: Choose brand hue based on product personality. Use purple intentionally —
   if it is your brand, great. If not, use the brand color you defined.

C. Too many colors — more than 3 hues in non-semantic roles:
   If your UI uses blue for primary, green for CTAs, orange for warnings, red for errors,
   purple for categories, and teal for tags — that is 6 hues with no hierarchy.
   GOOD: 1 brand hue + 1 semantic palette (green/red) + 1 neutral. That is all.

D. Not using subtle / muted colors:
   BAD: text-blue-600 on bg-white for every interactive element = saturated noise.
   GOOD: Use muted variants for secondary states — text-blue-400, text-slate-400.
   Reserve full-saturation color for the single primary action per view.

60-30-10 Rule (REQUIRED):
  60% = Dominant neutral (white, off-white, soft cream — the canvas)
  30% = Secondary (low-opacity brand tint, or a complementary neutral for panels)
  10% = Accent (brand color at full saturation — CTAs, active states, highlights ONLY)

  Enforce this ratio at layout planning, not as an afterthought.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. FORBIDDEN: Poor Gradient Combinations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pattern: Gradients using 3+ hues (rainbow), or color families with no hue harmony.

BAD:
  linear-gradient(to right, #6366f1, #ec4899, #f97316)
  // 3 unrelated hues — indigo, pink, orange — no harmony
  linear-gradient(135deg, purple, blue, green, yellow)
  // Rainbow sweep on a card background

GOOD gradient rules:
  - 1 to 2 colors only. No more.
  - Hue shift within 40 degrees on the color wheel for automatic harmony.
    Good pairs: indigo-to-blue, rose-to-orange, emerald-to-teal.
  - On large surfaces: very subtle lightness shift (5-15%). Not saturated.
    bg: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) — almost invisible, adds depth.
  - Decorative / hero use only: bolder gradients (135deg, #6366f1, #4f46e5) are fine
    on hero banners or button accents.
  - Never put a rainbow gradient on a surface where text sits.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. FORBIDDEN: Typography Mismatch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Common AI-generated bad pairings:
  - Roboto everywhere: system default, zero personality
  - Playfair Display headline + Inter body on a developer tool: editorial serif
    on a utility product is a personality mismatch
  - All-caps + ultra-thin weight on body text: unreadable
  - h1: 32px, h2: 30px, h3: 28px: no meaningful scale differentiation

Type scale (define in :root / global CSS):
  --text-xs: 11px;   /* Timestamps, overline labels */
  --text-sm: 13px;   /* Secondary body, metadata */
  --text-base: 15px; /* Primary body text */
  --text-md: 17px;   /* Lead / intro paragraphs */
  --text-lg: 20px;   /* Section headings */
  --text-xl: 24px;   /* Page subheadings */
  --text-2xl: 30px;  /* Page headings */
  --text-3xl: 40px;  /* Hero display */

Pairing rule by product personality:
  Utility tools (dashboards, dev tools):   Geometric sans — Inter, DM Sans, Plus Jakarta Sans
  Editorial / content:                     Serif accent headline + neutral body
  Creative / agency:                       Expressive display for hero only, neutral everywhere else
  Never mix more than 2 font families. Never.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. REQUIRED: Subtle Shadows — Not Flat, Not Dark
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Completely flat UI (zero shadows) reads as an unfinished wireframe.
Dark shadows (rgba(0,0,0,0.3)+) look cheap and heavy.

Define in :root (global CSS):
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.09), 0 4px 8px rgba(0, 0, 0, 0.05);

Application rules:
  Cards at rest:  var(--shadow-sm)
  Cards on hover: var(--shadow-md)   (upgrade shadow on hover, always)
  Modals:         var(--shadow-lg)
  Dropdowns:      var(--shadow-md)
  Buttons:        none at rest, var(--shadow-xs) on hover

NEVER: box-shadow: 0 4px 6px rgba(0,0,0,0.4)  — too dark, kills the light aesthetic.
NEVER: No shadow at all on interactive card surfaces.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. REQUIRED: Border Radius Consistency (Scale + Nesting Rule)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Define in :root (global CSS) — use only these values, nothing arbitrary:
  --radius-xs:   4px;     /* Tiny chips, inner badges */
  --radius-sm:   6px;     /* Buttons, small inputs */
  --radius-md:   10px;    /* Cards, panels */
  --radius-lg:   14px;    /* Modals, drawers, large cards */
  --radius-xl:   18px;    /* Hero blocks, feature sections */
  --radius-full: 9999px;  /* Pills, avatar circles */

Nesting Rule (enforce without exception):
  Outer container radius = Inner element radius + the padding gap between them.

  Example: Card has padding: 16px. It contains a code block with radius 8px.
    Card radius = 8 + 16 = 24px minimum (rounded-2xl or rounded-3xl).

  If an inner button has radius 6px and sits inside a card with padding 12px:
    Card needs at least radius 18px to look intentional.

Per-component defaults:
  Buttons:          6-8px   (--radius-sm)
  Inputs:           6-8px   (--radius-sm)
  Badges (inline):  4-6px   (--radius-xs to --radius-sm)
  Badges (status):  9999px  (--radius-full)
  Cards:            10-14px (--radius-md to --radius-lg)
  Modals:           14-18px (--radius-lg to --radius-xl)
  Dropdowns:        8-12px  (--radius-sm to --radius-md)

NEVER: Mix rounded-sm on a card that contains rounded-2xl buttons — visual hierarchy breaks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. REQUIRED: Minimum Animation Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Static UI with no motion feels dead. But animation must be purposeful — not decorative chaos.

Define in :root (global CSS):
  --transition-fast: 100ms ease;
  --transition-base: 180ms ease;
  --transition-slow:  320ms ease;

Global base rule (put in global.css):
  button, a, [role="button"] {
    transition:
      color          var(--transition-base),
      background-color var(--transition-base),
      border-color   var(--transition-base),
      box-shadow     var(--transition-base),
      transform      var(--transition-base),
      opacity        var(--transition-base);
  }

Minimum required interactions:
  Button hover:      scale(1.01) + shadow upgrade (--transition-fast)
  Card hover:        translateY(-2px) + shadow upgrade (--transition-base)
  Focus ring:        ring with transition — never instant
  Accordion open:    max-height transition or opacity + translateY, not instant jump
  Badge/chip hover:  background-color shift only, no scale
  Loading skeleton:  shimmer — bg-gradient-to-r + animate-pulse at 1.5s ease infinite

NEVER: Use no transition on interactive hover states.
NEVER: Use heavy JS-based animation (GSAP, Framer) for simple micro-interactions
       that CSS handles in 3 lines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. REQUIRED: Global CSS Token System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All reusable values MUST live in :root in global.css.
Inline magic numbers are forbidden. Every value must point to a token.

:root {
  /* base */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.15 0 0);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0 0);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0 0);

  /* brand (blue) */
  --primary: oklch(0.62 0.22 260);
  --primary-foreground: oklch(1 0 0);

  /* gray system */
  --secondary: oklch(0.96 0.01 260);
  --secondary-foreground: oklch(0.2 0 0);

  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.45 0 0);

  --accent: oklch(0.94 0.02 260);
  --accent-foreground: oklch(0.5 0.15 260);

  --destructive: oklch(0.62 0.19 25);
  --destructive-foreground: oklch(1 0 0);

  --border: oklch(0.92 0.01 260);
  --input: oklch(0.94 0 0);
  --ring: oklch(0.62 0.22 260);

  /* charts */
  --chart-1: oklch(0.75 0.15 150);
  --chart-2: oklch(0.62 0.22 260);
  --chart-3: oklch(0.73 0.17 50);
  --chart-4: oklch(0.58 0.18 260);
  --chart-5: oklch(0.55 0 0);

  /* sidebar */
  --sidebar: oklch(0.98 0.005 260);
  --sidebar-foreground: oklch(0.15 0 0);
  --sidebar-primary: oklch(0.62 0.22 260);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.94 0 0);
  --sidebar-accent-foreground: oklch(0.15 0 0);
  --sidebar-border: oklch(0.94 0 0);
  --sidebar-ring: oklch(0.62 0.22 260);

  /* fonts */
  --font-sans: "Plus Jakarta Sans", sans-serif;
  --font-serif: "Lora", serif;
  --font-mono: "IBM Plex Mono", monospace;

  /* radius */
  --radius: 0.6rem;

  /* shadows (soft, modern) */
  --shadow-x: 0px;
  --shadow-y: 4px;
  --shadow-blur: 12px;
  --shadow-spread: -2px;
  --shadow-opacity: 0.08;
  --shadow-color: hsl(220 40% 10%);

  --shadow-2xs: 0 1px 2px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 2px 4px hsl(0 0% 0% / 0.06);
  --shadow-sm: 0 4px 8px hsl(0 0% 0% / 0.08);
  --shadow: 0 6px 12px hsl(0 0% 0% / 0.1);
  --shadow-md: 0 10px 20px hsl(0 0% 0% / 0.12);
  --shadow-lg: 0 16px 30px hsl(0 0% 0% / 0.14);
  --shadow-xl: 0 24px 40px hsl(0 0% 0% / 0.16);
  --shadow-2xl: 0 32px 60px hsl(0 0% 0% / 0.25);

  /* spacing + typography */
  --tracking-normal: -0.02em;
  --spacing: 0.27rem;
}

.dark {
  --background: oklch(0.22 0.01 260);
  --foreground: oklch(0.95 0 0);

  --card: oklch(0.26 0.01 260);
  --card-foreground: oklch(0.95 0 0);

  --popover: oklch(0.26 0.01 260);
  --popover-foreground: oklch(0.95 0 0);

  --primary: oklch(0.7 0.2 260);
  --primary-foreground: oklch(1 0 0);

  --secondary: oklch(0.3 0.01 260);
  --secondary-foreground: oklch(0.95 0 0);

  --muted: oklch(0.3 0.01 260);
  --muted-foreground: oklch(0.7 0 0);

  --accent: oklch(0.28 0.03 260);
  --accent-foreground: oklch(0.8 0.1 260);

  --destructive: oklch(0.7 0.16 25);
  --destructive-foreground: oklch(1 0 0);

  --border: oklch(0.33 0.01 260);
  --input: oklch(0.33 0.01 260);
  --ring: oklch(0.7 0.2 260);

  --sidebar: oklch(0.2 0.005 260);
  --sidebar-foreground: oklch(0.95 0 0);
  --sidebar-primary: oklch(0.7 0.2 260);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.3 0.01 260);
  --sidebar-accent-foreground: oklch(0.7 0.2 260);
  --sidebar-border: oklch(0.33 0.01 260);
  --sidebar-ring: oklch(0.7 0.2 260);
}