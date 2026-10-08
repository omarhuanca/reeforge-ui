---
# gstack: design-md-format=spec
name: Reeforge
description: A living ocean behind frosted glass, deep blue lit from above, cool volcanic basalt, and one ember of forge fire. Alive and inviting, yet calm and perfectly legible where the numbers are.
colors:
  primary: "#0C6496"
  primary-top: "#1A7DB5"
  primary-hover: "#0A5784"
  primary-active: "#084A70"
  primary-soft: "#E3F0F8"
  on-primary: "#FFFFFF"
  lagoon: "#0E7490"
  lagoon-soft: "#E0F2F6"
  accent: "#E0592A"
  accent-strong: "#C2461C"
  accent-soft: "#FCE9E1"
  background: "#F4F6F8"
  surface: "#FFFFFF"
  surface-subtle: "#EEF1F4"
  text: "#121A22"
  text-muted: "#566270"
  text-subtle: "#687482"
  border: "#DDE3E9"
  border-strong: "#C4CDD6"
  success: "#1F7A3A"
  success-bg: "#E3F3E6"
  warning: "#8A5A00"
  warning-bg: "#FBEFD5"
  error: "#B42318"
  error-bg: "#FDE7E4"
  info: "#0E7490"
  info-bg: "#E0F2F6"
  chart-1: "#0C6496"
  chart-2: "#3AA6B9"
  chart-3: "#C99A2E"
  chart-4: "#6B7A8A"
  chart-5: "#8FB8D6"
  chart-highlight: "#E0592A"
  dark-background: "#0C1218"
  dark-surface: "#121A22"
  dark-surface-subtle: "#18212B"
  dark-text: "#E6EDF3"
  dark-text-muted: "#95A3B2"
  dark-border: "#24303C"
  dark-primary: "#3A9FD8"
  dark-primary-text: "#6CC0EE"
  dark-on-primary: "#03202E"
  dark-accent: "#F27A4C"
typography:
  display:
    fontFamily: General Sans
    fontWeight: 600
    fontSize: 2.5rem
    lineHeight: 1.15
    letterSpacing: -0.02em
  h1:
    fontFamily: General Sans
    fontWeight: 600
    fontSize: 1.75rem
    lineHeight: 1.2
    letterSpacing: -0.01em
  h2:
    fontFamily: General Sans
    fontWeight: 600
    fontSize: 1.25rem
    lineHeight: 1.3
    letterSpacing: -0.01em
  h3:
    fontFamily: IBM Plex Sans
    fontWeight: 600
    fontSize: 1rem
    lineHeight: 1.4
  body:
    fontFamily: IBM Plex Sans
    fontWeight: 400
    fontSize: 0.875rem
    lineHeight: 1.55
  body-lg:
    fontFamily: IBM Plex Sans
    fontWeight: 400
    fontSize: 1rem
    lineHeight: 1.6
  label:
    fontFamily: IBM Plex Sans
    fontWeight: 600
    fontSize: 0.8125rem
    lineHeight: 1.45
  caption:
    fontFamily: IBM Plex Sans
    fontWeight: 400
    fontSize: 0.75rem
    lineHeight: 1.35
  kpi:
    fontFamily: General Sans
    fontWeight: 600
    fontSize: 1.75rem
    fontFeature: tnum
  mono:
    fontFamily: IBM Plex Mono
    fontWeight: 400
    fontSize: 0.92em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "8": 32px
  "10": 40px
  "12": 48px
  "16": 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 36px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.md}"
    height: 36px
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-strong}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: 36px
  panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
  badge:
    rounded: "{rounded.sm}"
    height: 22px
  table-row:
    height: 44px
  table-header:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text-muted}"
    height: 36px
  nav-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
---

# Reeforge

## Overview

**Creative North Star:** a living ocean seen through frosted glass, deep blue lit from the surface, with one ember of forge fire. The chrome of the app breathes; the data stays still and sharp. It reads as a serious financial tool with a modern, inviting digital feel, rooted in the Pacific without folklore.

**The name is a triple meaning, and the system expresses each part:**
- **Reef**: we operate in the Pacific. Ocean blue is the primary color, lagoon supports it, cool basalt (Vanuatu's volcanic stone) is the ground.
- **Forge**: we build technology. The ember accent, halfway between reef coral and molten metal, marks key figures and brand moments.
- **Reforge**: continuous improvement. It lives in motion: things visibly get better (a failed invoice turning to Fiscalized lights up for a moment).

**Product context:** Reeforge is a hub of SaaS apps for running businesses, sold by Worth It. The first app is **Reeforge Finance**: it fiscalizes Xero invoices with Vanuatu's government TaxCore system. Users are company accountants and finance staff in Vanuatu, plus Reeforge admins who manage many companies. Every app in the hub shares this system.

**Mode per surface:**
- Operate (tables, forms, settings, dashboards): almost every screen. Density and legibility first.
- Persuade (login, onboarding, empty states): the brand speaks a little louder here (ocean gradient panel, display type).

**Reference sites:** Mercury, Stripe and Ramp for calm financial tables. Xero (shown next to Reeforge every day): we stay clearly distinct from its sky cyan.

**Key characteristics:**
- Calm basalt neutrals; color means something.
- Ocean blue = what you can act on. Ember = the single most important figure on the screen.
- A slow fluid ocean drifts behind frosted-glass chrome (top bar, sidebar, stats, modals); tables and forms stay near-opaque.
- Depth through a flowing ocean-to-lagoon gradient on actions and soft blue-tinted shadows on panels.
- Amounts right-aligned in tabular figures; identifiers in mono.
- The TaxCore environment (Sandbox / Production) is visible on every screen.

**Living reference:** open `design/preview.html` in a browser. It shows every token and component in light and dark mode, with real Reeforge Finance content. The CSS reference implementation is `design/components.css`.

## Colors

**Strategy:** Restrained, with depth. Basalt neutrals carry the page; one interactive hue (ocean blue); one rare accent (ember); four status colors that always come with a word.

**Light or dark:** both ship in v1. Light is the default: accountants work in offices and shops in daylight. Dark is the "ocean at night": it follows the OS setting, or the app forces it with `<html data-theme="dark">`.

**Roles:**
- `primary` (ocean blue): primary buttons, links, focus ring, selected nav item and rows, checked controls, chart series 1. Primary buttons use the `--rf-gradient-primary` gradient (from `primary-top` to `primary`).
- `lagoon`: info alerts and badges, chart series 2. It keeps the ocean palette alive next to the blue.
- `accent` (ember): the hero figure of a screen **only when nothing needs action** (for example the month's total amount), one highlight annotation per chart (`chart-highlight`, never a whole series), brand moments. **Never** on a button, a status, or an error: it would read as an alert. Ember as text only at 20px or larger; for smaller text use `accent-strong` (5:1 on white).
- Status: `success` = Fiscalized / Valid / Connected; `warning` = Pending / Expiring / Needs setup / Sandbox; `error` = Failed / Revoked; neutral gray = Expired / Not connected.
- Neutrals are cool basalt, slightly blue so they sit naturally under the ocean blue.

**Dark mode** does not just invert: surfaces step up in lightness with elevation (background `#0C1218` → surface `#121A22` → subtle `#18212B`), the blue lightens to `#3A9FD8` with dark text on it, and shadows become pure black at higher opacity.

**Contrast (checked, WCAG AA):** white on primary 6.4:1 (gradient top 4.5:1); muted text 6.2:1; subtle text 4.9:1 on white; status badges 4.7 to 5.6:1; dark mode body pairs above 7:1.

**All values live in `design/tokens.css` as `--rf-*` CSS variables, including the full dark set. Pages never use a raw hex.**

## Typography

Three faces, each with one job:
- **General Sans** (Fontshare, ITF Free Font License, free for commercial use): display, h1, h2, stat values. Its firm, slightly cut geometry is the forged voice. Never used for body text or tables.
- **IBM Plex Sans** (Google Fonts, SIL OFL): all UI, body, labels, tables, h3. An engineer's typeface: very legible at small sizes, true tabular figures, full Latin coverage for English and Bislama.
- **IBM Plex Mono** (Google Fonts, SIL OFL): identifiers people copy or compare: TaxCore invoice numbers, certificate UIDs, request IDs, Xero tax type codes.

**Scale** (see the front matter for exact values): display 40, h1 28, h2 20, h3 16, body-lg 16, body 14 (the default), sm 13 (tables, labels), xs 12 (captions, badges, table headers), kpi 28. Levels differ by size, not only weight.

**Loading:** `design/fonts.css` loads them from the CDNs for prototypes. In production, self-host the WOFF2 files. Weights used: General Sans 500/600/700, Plex Sans 400/500/600/700 + 400 italic, Plex Mono 400/500.

**Rules:**
- Test every new screen with the "Long strings test" button of `design/preview.html` (pseudo-localization, +35% length) before Bislama translations exist. Nothing may wrap or clip.
- Amounts: `font-variant-numeric: tabular-nums`, right-aligned in tables. Currency format "VT 23 000" (vatu, no decimals, space as thousands separator).
- Sentence case everywhere ("Connect Xero", "Upload certificate").
- The UI ships in English and Bislama. Bislama strings run up to ~30% longer: never size a button, tab or column to the English text.

## Layout

- **Shell** (identical in every hub app): left sidebar 240px (hub name + app name, navigation, "All Reeforge apps" at the bottom), top bar 56px (company switcher on the left; TaxCore environment badge, search and user avatar on the right), content up to 1280px wide with a 24px gutter.
- **Page header:** h1 + one-line description on the left; actions on the right, secondary first, primary last. One primary button per view, and it follows the situation: on Invoices it is "Retry failed (N)" when invoices failed, and there is none otherwise (invoices are fiscalized automatically from Xero; manual fiscalization is secondary).
- **One signal per level:** a problem shows once where you navigate (red count in the nav) and once where you act (the alert on the page). Tabs are plain filters without repeated counts.
- **Rhythm:** 4px base. 20px inside panels, 24px between panels, 32px between page sections, 32px above the page header.
- **Density:** table rows 44px (36px compact for long admin lists), header row 36px, controls 36px (32px small, 44px on login and empty states).
- **Under 900px:** a menu button (`rf-menu-btn`) appears at the left of the top bar and opens the sidebar as a drawer (`.rf-sidebar[data-open="true"]` + `rf-drawer-backdrop` as its next sibling; Esc, a tap outside, or choosing an item closes it; `aria-expanded` on the button). The language switcher and search move into the user menu (`rf-hide-mobile`). Panels stack in one column, tabs scroll horizontally, tables scroll horizontally inside their frame. No horizontal page scroll.
- **Language:** an English / Bislama switcher (`rf-lang`) sits at the top right of the login form and in the top bar (user menu on mobile). It is always reachable before and after sign-in.
- **Login:** two columns, a plain form on the left and the ocean gradient panel on the right showing what the product produces (a fiscalized invoice summary). Under 900px the panel is hidden.

## Elevation & Depth

Depth is part of the identity: light comes from above, like looking into water, and the water moves.

**Two layers, never mixed:**
- **Chrome is alive.** One `.rf-fluid` background per page (three soft blobs: ocean, lagoon, deep; the first one sits behind the sidebar and top bar so the glass reads even in light mode) drifts over 38 seconds. No ember in the background: diluted, it turns pink and reads as an error. On top of it, frosted glass (`.rf-glass`, `--rf-glass-bg` 68% white / 62% basalt in dark, 18px blur, 160% saturation, a 1px light border and inner top highlight) is used only for: top bar, sidebar, stats strip, modals (`--rf-glass-bg-strong`), the login panel's receipt.
- **Data is still.** Tables, forms and panels with long text use `--rf-surface-data` (94% opaque) with **no blur** (the blur would be invisible and costs performance on every block). The fluid shows through as a faint tint; figures stay perfectly sharp.

**Legibility rules for glass (checked over the most saturated blob):** body text and muted text pass AA (muted 4.7:1 light, 5.7:1 dark). `text-subtle` does **not** pass on glass: never put it there. Browsers without `backdrop-filter` fall back to the solid surface. `prefers-reduced-motion` stops the drift. Only one `.rf-fluid` per page, and blobs never sit inside data containers.
- **Gradients, only through tokens:** `--rf-gradient-primary` (135° ocean-top → ocean → lagoon; primary buttons, avatar, checked controls; on hover the gradient flows across over 600ms), `--rf-gradient-danger` (danger buttons), `--rf-gradient-surface` (secondary buttons, a barely visible white to off-white), `--rf-gradient-ocean` (login and onboarding panels), `--rf-gradient-page` (a pale blue wash at the top of the page background).
- **Shadows are offset, soft and blue-tinted** (`rgb(12 34 56)` base): `--rf-shadow-xs` (secondary buttons, top bar), `--rf-shadow-sm` (panels, tables, stat strip), `--rf-shadow-md` (hovered or raised items), `--rf-shadow-popover` (menus, dropdowns), `--rf-shadow-modal` (dialogs). Primary buttons get `--rf-shadow-button`: a small drop plus a 1px inner top highlight.
- Inputs are slightly recessed (`--rf-shadow-inset`).
- Never a zero-offset colored glow. Never glass behind tables, forms or long text. Never a blue-to-purple gradient. Never gradient text.

## Shapes

- `sm` 4px: badges, checkboxes. `md` 8px: buttons, inputs, nav items, alerts, toasts. `lg` 12px: panels, tables, stat strip, modals. `full`: avatars, switches.
- Nested elements use a smaller radius than their container (inner radius = outer radius minus the gap).
- Status badges are small rounded rectangles, not pills.

## Components

All of these are implemented in `design/components.css` (classes `rf-*`) and shown in `design/preview.html`. Port them to the app's stack with the same tokens and the same states.

- **Buttons** (`rf-btn` + `--primary | --secondary | --ghost | --danger | --danger-ghost`, sizes `--sm | default | --lg`): hover brightens primary by 8%; active presses 1px down; focus-visible shows a 2px blue outline offset by 2px; loading (`aria-busy`) keeps the width, shows a spinner and says what is happening ("Sending to TaxCore…"); disabled is 50% opacity and must say why. Labels are verb + object: "Fiscalize invoice", "Connect Xero", "Retry failed (3)". Never "Submit", "OK" or "Click here". Destructive actions always confirm in a modal that names what is lost.
- **Forms** (`rf-field`, `rf-label`, `rf-input`, `rf-select`, `rf-textarea`, `rf-check`, `rf-switch`): label above, help text below, the error replaces the help text (`aria-invalid="true"`, red border, icon + message saying what to fix). Optional fields are marked "(optional)"; required is the default. One column; the primary action sits bottom left, aligned with the fields. Identifiers use `rf-input--mono`.
- **Badges** (`rf-badge--success | --warning | --danger | --info | --neutral | --sandbox | --production`): one badge per domain state, the same everywhere. Invoice: Fiscalized / Pending / Failed. Certificate: Valid / Expires in N days / Revoked / Expired. Xero: Connected / Needs setup / Not connected. Environment: Sandbox / Production.
- **Alerts** (`rf-alert--info | --success | --warning | --danger`): bold summary, then what to do, with a link to the fix. Never a raw TaxCore error code alone.
- **Sandbox signal:** amber Sandbox badge in the top bar (tooltip "Sandbox · test invoices, no legal value") plus `rf-sandbox-strip`, a thin solid 2px amber line (`--rf-sandbox-line`) across the top of every page. No hazard stripes: Sandbox is the safe environment and is on screen most of the time during setup and demos, so the signal stays calm. In Production the badge is a calm blue outline.
- **Stats** (`rf-stats` > `rf-stat`): one glass strip with dividers, not floating cards. Label, value (General Sans, tabular), optional delta. **At most one colored value per strip.** If something needs action (failures), that cell comes first, gets `rf-stat--action` (danger tint, danger label) and a link to fix it, and every other value is neutral. If nothing needs action, the hero figure takes the ember (`rf-stat__value--accent`).
- **Charts:** series in token order (ocean, lagoon, sand, slate, sky). Ember only as one annotation (`chart-highlight`), for example the record day.
- **Tables** (`rf-table-wrap` > `rf-table`): muted 12px header on a subtle background; row hover; a selected row gets the primary soft background; amounts in `rf-col-num`; identifiers in `rf-col-id` (mono, muted); sortable headers with `aria-sort`; a footer with the count and Previous/Next. Every table designs four states: loading (skeleton rows), empty (`rf-empty`: a title, one sentence, one action), error (danger alert above the table with a retry), long content (truncate with a tooltip; never wrap identifiers).
- **Top bar** (`rf-topbar__start`, `rf-topbar__end`): menu button (mobile), company switcher (`rf-company-switcher` with `rf-avatar--company`: a neutral square, so it never looks like the user) on the left; environment badge, language switcher, search, user avatar (blue circle) on the right.
- **Mapped values** always show their meaning: TaxCore labels read "A · VAT 15%", never a bare "A".
- **One button per action:** when the page header holds the primary action (for example "Upload certificate" on a company without a usable certificate), the alert that explains the problem carries no button of its own. Other page-level actions ("Rename company") are secondary buttons, never plain text.
- **Segmented filter** (`rf-segmented`, inside `rf-toolbar`): status filters inside a section, with counts (`rf-segmented__count`, danger for failures). Tabs (`rf-tabs`) switch sections of a page; filters narrow a list. Never two rows of identical tabs. The default filter is always "All".
- **Filtered empty state:** name what is empty ("No fiscalized invoices yet"), one sentence, and the way back ("Show all invoices"). Never a generic "No invoice has this status".
- **Row actions** (`rf-menu-wrap` > "…" icon button + `rf-menu`): every row action beyond the main link goes in the menu. Destructive items go last after `rf-menu__sep`, in danger color (`rf-menu__item--danger`), and still confirm in a modal. Never a red "Delete" link on every row. The menu opens below, aligned right; Esc and outside click close it; focus moves to the first item. A table with row menus uses `rf-table-wrap--menus` so the wrapper never clips the menu; if the table must scroll horizontally (wide tables on mobile), keep the scroll and flip the menu upward with `rf-menu--up` when there is no room below, or render it outside the scroll container (popover attribute or portal).
- **Pagination:** only when there is more than one page.
- **File input** (`rf-file`): a drop zone with an icon, the accepted types and the size limit; after selection it shows the file name and size. Never the bare browser "Choose File" button.
- **Secret fields** (`rf-input-group` + `rf-input-group__btn`): passwords and the TaxCore PAC are masked with a show/hide button, `autocomplete="new-password"` or `"off"`, `spellcheck="false"`. Every technical acronym (PAC, VSDC, UID) gets a help line saying what it is and where it comes from.
- **User menu** (avatar button + `rf-menu`): "Signed in as …", theme as a Light / Dark / System segmented control, Sign out.
- **App shell** (`rf-shell`, `rf-sidebar`, `rf-nav-item`, `rf-topbar`, `rf-main`, `rf-page-head`, `rf-tabs`): the active nav item uses the primary soft background with a faint blue inset ring; an error count sits at the right of the nav item in red.
- **Modals** (`rf-modal`): only for confirmations and short focused tasks (for example "Add company" with one or two fields; longer forms get their own page). **A modal always opens above the whole page, centered, on a dimmed backdrop: never in the page flow.** Preferred markup: `<dialog class="rf-modal">` opened with `showModal()` (native focus trap, Esc closes, `::backdrop` styled). Alternative: `rf-overlay` (fixed, full screen) wrapping `rf-modal` with `role="dialog" aria-modal="true"`. Focus goes to Cancel on open (destructive modals) or to the first field (forms), and returns to the trigger on close. A click on the backdrop closes it, except while a form has unsaved input. The title asks the question ("Delete Tanna Coffee Co.?"), the body states the consequences, the footer has Cancel then the action. `rf-overlay--inline` exists only to display a modal inside `design/preview.html`; never use it in the product.
- **Toasts** (`rf-toast`): a finished action in past tense ("Invoice fiscalized"), disappear after 5 seconds, never carry errors (errors stay on the page).

## Do's and Don'ts

- Do use only `--rf-*` tokens; never a raw hex, shadow or gradient in a page.
- Do show the TaxCore environment on every screen.
- Do right-align amounts in tabular figures and set identifiers in mono.
- Do design loading, empty, error and long-content states together with the happy path.
- Do write labels as verb + object, in sentence case, and leave room for Bislama.
- Don't use ember for a button, a status, an error or small text.
- Don't put a panel inside a panel, and don't wrap every block in its own panel.
- Don't use colored left borders on panels or alerts, glows, blue-to-purple gradients or gradient text.
- Don't put tables, forms or long text on see-through glass, and don't use `text-subtle` on glass.
- Don't rely on color alone for a status: always pair it with the word.
- Don't use the sky cyan of Xero or a generic royal blue as the primary.

## Motion

- **Approach:** intentional. The background ocean drifts slowly (38s cycle); everything else moves only to explain a change, plus one authored moment.
- **Easing:** enter `--rf-ease-out` (cubic-bezier(0.2, 0.8, 0.2, 1)), move `--rf-ease-in-out`.
- **Duration:** fast 120ms (hover, press), base 200ms (switches, state changes), slow 600ms (the reforge moment).
- **The one authored moment, "reforge":** when an invoice turns to Fiscalized (after a retry or a live update), the row flashes the primary soft background and fades out over 600ms (`rf-row-reforged`). It says "this just got better" without a toast.
- `prefers-reduced-motion` turns all animation off.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-07 | Initial design system created | Created by /design-consultation with Raquel, from the product context (Reeforge Finance: Xero ↔ TaxCore), quick research of finance SaaS (Mercury, Stripe, Ramp, Xero's XDL), and the memorable goal "reliable, compliant". |
| 2026-10-07 | The name drives the identity: reef + forge + reforge | Raquel: the name is a triple meaning (Pacific, building tech, continuous improvement). Ocean palette, ember accent, reforge motion moment. |
| 2026-10-07 | Ocean blue `#0C6496` as primary (chosen over lagoon teal, pure blue and night blue) | Raquel asked for blue instead of green; the ocean blue keeps the water feel, stays distinct from Xero's cyan and generic SaaS blue, and pairs with the ember. |
| 2026-10-07 | More digital depth: tokenized gradients and soft shadows | Raquel asked for a more "digital interface" feel (gradient, volume, shadow) while keeping the ocean. Limited to named tokens to stay coherent. |
| 2026-10-07 | Living UI: fluid ocean background + frosted glass on chrome | Raquel found the system too flat and asked for gradient and a glass fluid effect without losing legibility. Glass limited to chrome; data surfaces stay 94% opaque; contrast checked in the worst case. |
| 2026-10-07 | Critique fixes: mobile drawer + EN/Bislama switcher; contextual primary action and one colored value per stats strip; lagoon replaces ember as chart series 2; no ember blob, no blur on data surfaces | From the design critique, applied at Raquel's request. |
| 2026-10-08 | New components: segmented filter, file drop zone, secret field, "…" menu; rules for one button per action, default "All" filter, filtered empty state, pagination, user menu theme choice | Gaps found while reviewing the first real company detail and companies list screens. |
| 2026-10-08 | Modals always open above the page (`<dialog>` / fixed `rf-overlay`) | In the real app the delete and create modals rendered in the page flow: the preview showed the modal in a display box and the component did not encode its positioning. Fixed in the component; the display box is now an explicit `rf-overlay--inline`. |
| 2026-10-08 | Sandbox line: solid 2px amber instead of hazard stripes | Seen in the real app, the striped line read as construction tape and duplicated the badge. Raquel approved the calmer version. |
| 2026-10-07 | General Sans + IBM Plex Sans + IBM Plex Mono | Most legible on dense amount tables; headings with a forged character that still reads as trustworthy. |
| 2026-10-07 | Light and dark both in v1; UI in English and Bislama | Raquel's choices. |
