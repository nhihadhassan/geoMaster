---
name: GeoMaster
description: Premium map-first geography learning app with an atlas HUD and quiz feedback system.
colors:
  atlas-void: "#05080c"
  panel-ink: "#090f1a"
  panel-zinc: "#18181b"
  slate-map: "#f1f5f9"
  text-primary: "#f8fafc"
  text-muted: "#cbd5e1"
  border-glass: "#ffffff1f"
  cyan-atlas: "#22d3ee"
  cyan-soft: "#bae6fd"
  emerald-correct: "#34d399"
  emerald-fill: "#22f6a5"
  amber-assisted: "#fbbf24"
  rose-missed: "#f7b7b0"
  rose-error: "#fda4af"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.24em"
  mono:
    fontFamily: "Geist Mono, Geist Mono Fallback, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  chip: "9999px"
  control: "12px"
  card: "16px"
  sheet: "24px"
  dossier: "24px"
  modal: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  safe-bottom: "calc(0.75rem + env(safe-area-inset-bottom))"
components:
  button-primary:
    backgroundColor: "{colors.emerald-correct}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.chip}"
    padding: "12px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.border-glass}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.chip}"
    padding: "10px 16px"
    height: "44px"
  chip-glass:
    backgroundColor: "{colors.panel-zinc}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.chip}"
    padding: "8px 16px"
    height: "44px"
  input-quiz:
    backgroundColor: "{colors.border-glass}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  sheet-glass:
    backgroundColor: "{colors.panel-ink}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sheet}"
    padding: "16px"
---

# Design System: GeoMaster

## 1. Overview

**Creative North Star: "The Living Atlas Console"**

GeoMaster is a premium atlas that becomes a game without losing the calm authority of the map. The interface should feel like a focused command layer floating over a beautiful globe: dark, precise, compact, and deferential to Mapbox. Every visible control must earn its place because the map is the product surface.

This is a product UI, not a landing page. Familiar controls are a virtue: chips open drawers, sheets hold setup, buttons start or pause, and quiz state is shown with concise data. The personality comes from the blue globe identity, atlas typography, restrained glass, and clear feedback color, not from decorative clutter.

GeoMaster rejects classroom kitsch, neon arcade graphics, generic SaaS cards, and large panels that compete with gameplay. Glass is allowed only because the map is underneath it. If the blur stops serving map readability, remove it.

**Key Characteristics:**

- Map-first: overlays stay compact by default and expand only when the user asks.
- Premium dark atlas: deep zinc surfaces, cyan geography accents, emerald success feedback.
- Game clarity: correct is green, assisted is amber, missed is rose, and those meanings never drift.
- Mobile discipline: one large surface at a time, 44px touch targets, safe-area-aware controls.

## 2. Colors

The palette is a restrained night-console system over a pale Mapbox atlas, with cyan as geographic signal and emerald as reward.

### Primary

- **Atlas Cyan**: Used for map targets, brand glow, detail accents, focus rings, and learning-mode emphasis.
- **Correct Emerald**: Used for primary quiz success, Start Quiz emphasis, correct fills, and successful feedback.

### Secondary

- **Assisted Amber**: Used only for assisted answers, hints, and cautionary helper feedback.
- **Missed Rose**: Used only for missed or wrong quiz feedback. It must never become a decorative accent.

### Neutral

- **Atlas Void**: The app shell background and deepest loading surface.
- **Panel Ink**: The main glass panel color behind HUDs, sheets, cards, and overlays.
- **Slate Map**: The map atmosphere, fog, halos, and pale geography context.
- **Text Primary**: Primary text over dark panels.
- **Text Muted**: Secondary labels and helper text. Do not drop below roughly 50% opacity for important copy.
- **Glass Border**: The default translucent border for floating UI.

### Named Rules

**The Feedback Color Rule.** Green means correct, amber means assisted, rose means missed or wrong. These colors are semantic, not decorative.

**The Cyan Geography Rule.** Cyan belongs to map targets, learning affordances, focus states, and brand atmosphere. Do not use it for destructive or completion states.

## 3. Typography

**Display Font:** Geist with system sans fallback  
**Body Font:** Geist with system sans fallback  
**Label/Mono Font:** Geist Mono for timers, debug data, and tabular counts

**Character:** The typography is native, sharp, and compact. It should read like a serious product console, not a poster or a textbook.

### Hierarchy

- **Display** (600, 48px, 1 line-height): Landing and rare celebratory moments only.
- **Headline** (600, 30px, 1.15 line-height): Results, country profiles, and major modal headings.
- **Title** (600, 18px, 1.25 line-height): HUD context, country names, section titles, and drawer headings.
- **Body** (500, 14px, 1.5 line-height): Country facts, drawer descriptions, helper text, and controls.
- **Label** (600, 10-11px, wide uppercase): HUD state labels, drawer section labels, and compact metadata.
- **Mono** (600, 14px, tabular): Timers, debug details, and numeric HUD data.

### Named Rules

**The Label Restraint Rule.** Uppercase tracking is for metadata only. Never use spaced uppercase for body text or country stories.

**The Atlas Readability Rule.** Body text over glass should keep a comfortable line height and never rely on opacity below 50% when the content is necessary to act.

## 4. Elevation

GeoMaster uses a hybrid of tonal layering, thin borders, blur, and soft shadows. Elevation must feel like instrument glass above a map, not like stacked web cards. The shadow vocabulary is dark and diffuse; highlights come from borders and semantic glows.

### Shadow Vocabulary

- **HUD Lift** (`0 10px 15px -3px rgba(0,0,0,0.24)`): Compact top HUDs and floating chips.
- **Panel Lift** (`0 20px 25px -5px rgba(0,0,0,0.30)`): Drawers, input docks, and inset panels.
- **Dossier Lift** (`0 24px 80px rgba(8,18,32,0.38)`): Country education cards and rich profile surfaces.
- **Success Glow** (`0 0 34px rgba(52,211,153,0.18)`): Start Quiz emphasis and short-lived success feedback only.

### Named Rules

**The Map Glass Rule.** Use blur only for overlays that sit directly on the map. Do not use glass for ordinary nested content inside an already-glass panel.

**The One Lift Rule.** A surface gets one elevation treatment: border plus blur, or border plus shadow. Do not stack heavy blur, heavy shadow, and nested cards unless the surface is a deliberate drawer.

## 5. Components

### Buttons

- **Shape:** Fully rounded chips for primary actions and compact controls (9999px), rounded rectangles for list rows and toggles (16px).
- **Primary:** Emerald fill or emerald-tinted glass, minimum 44px height, medium weight text.
- **Hover / Focus:** Slight fill increase, visible cyan or emerald focus outline, no bounce.
- **Secondary / Ghost:** White or zinc glass at low opacity with a thin border. Secondary actions must look quieter than Start Quiz.

### Chips

- **Style:** Pill shape, thin glass border, deep zinc translucent fill, compact label.
- **State:** Selected region and active mode use emerald or cyan tint. Locked quiz chips stay visible but subdued.

### Cards / Containers

- **Corner Style:** Dossiers and major panels use 24px radius; nested fact rows use 16px radius.
- **Background:** Dark zinc or slate overlays with 50-80% opacity depending on map contrast.
- **Shadow Strategy:** Use Panel Lift for ordinary overlays and Dossier Lift only for country profile cards.
- **Border:** Thin white or cyan translucent borders. No side-stripe accent borders.
- **Internal Padding:** 12-16px for compact panels, 16-24px for rich cards.

### Inputs / Fields

- **Style:** Bottom dock, dark glass shell, centered white text, 12-16px radius.
- **Focus:** Emerald border and soft emerald glow. Never shift layout on focus.
- **Error / Disabled:** Wrong answers use short rose border/glow feedback. Disabled inputs reduce opacity but keep text legible.

### Navigation

- **Style:** The HUD is navigation and status at once. It must stay slim and state-aware.
- **Mobile Treatment:** Top HUD stays compact. Region and mode live in bottom sheets. Large review or learning content uses one bottom drawer at a time.

### Country Dossier

Country profiles use a flag-led header, four factual rows, a featured image, one sentence of narrative, and optional quick facts. The image is part of the profile vocabulary, not decoration. If an image is missing, use the atlas placeholder, but treat that as content debt.

### Map Labels And Inset

Learning labels must appear progressively by zoom and density. The Caribbean inset is a contextual detail surface, not a permanent second map on mobile.

## 6. Do's and Don'ts

### Do:

- **Do** keep the map as the visual majority on every viewport.
- **Do** use the blue GeoMaster globe icon as the canonical brand mark.
- **Do** keep Start Quiz visually stronger than Choose Quiz when setup is open.
- **Do** preserve 44px minimum touch targets on mobile controls.
- **Do** use bottom sheets for mobile setup, learning details, and review.
- **Do** keep feedback colors semantic: green correct, amber assisted, rose missed.
- **Do** cap motion and Mapbox animation cadence. Feedback should be short, purposeful, and quiet.

### Don't:

- **Don't** turn Learning Mode into quiz setup. It should feel like calm atlas exploration.
- **Don't** show every label at world zoom or force tiny-country labels to overlap.
- **Don't** stack the correct toast and Caribbean inset on mobile.
- **Don't** use generic SaaS card grids, hero metrics, gradient text, or decorative side stripes.
- **Don't** use glassmorphism as default content styling. Glass exists because there is a map behind it.
- **Don't** add background audio or ambient soundscapes. Only short feedback sounds are allowed.
- **Don't** make desktop worse to solve mobile. Preserve the desktop atlas HUD quality.
