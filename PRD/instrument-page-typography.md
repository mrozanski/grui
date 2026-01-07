# String Authority — Instrument Page Typography & Hierarchy Handoff

This document defines the **authoritative typography, font usage, and hierarchy rules**
for the Instrument detail template.  
All rules are mandatory unless explicitly marked optional.

---

## 1. Font Stack (Canonical)

### Inter
Use for:
- Narrative body text
- Descriptive paragraphs
- Explanatory copy
- Timeline descriptions

### Manrope
Use for:
- Page title
- Section titles
- Subsection titles
- Spec labels
- UI labels (cards, pills, metadata labels)

### JetBrains Mono
Use only for:
- Identifiers
- Dates
- Numeric / machine-adjacent factual values
- Verification / attestation states

JetBrains Mono must be used **sparingly and deliberately**.

---

## 2. JetBrains Mono — Allowed Usage (Strict)

### Identifiers
- Serial numbers (e.g. `S/N 8 0005`)
- Registry IDs
- Attestation UIDs
- Transaction hashes
- IPFS hashes

### Dates
- Timeline dates only
- Attestation timestamps

### Numeric values (partial usage allowed)
- Measurements: `9.5 lbs`, `24.75"`, `22`
- Counts: attestation count
- Quantities: `2 × humbuckers`  
  (only `2 ×` in Mono; text remains Inter)

### Verification / Status values
- Verified
- Attested
- Pending

---

## 3. JetBrains Mono — Forbidden Usage

JetBrains Mono must **not** be used for:
- Page titles
- Section titles
- Subsection titles
- Paragraph text
- Spec labels
- Timeline event titles

---

## 4. Global Typography Scale Rules

Only **four text size categories** may exist on the page:

1. Page title
2. Section titles
3. Body text
4. Metadata (labels, dates, identifiers)

No ad-hoc font-size overrides.

All sizes must be tokenized (CSS variables or design tokens).

---

## 5. Instrument Title Block

### Title
- Largest text on the page
- Increase size by **+10–15%** vs current
- Manrope
- Slightly increased line-height

### Subtitle (nickname + serial)
- Manrope
- Size reduced **5–10%** vs title
- Lighter weight
- Serial number rendered in JetBrains Mono

---

## 6. Section Hierarchy (Critical)

### Tier 1 — Major Sections
Applies to:
- Instrument Details
- Specifications
- Provenance Timeline

Requirements:
- Manrope
- Size: +1 step above body text
- Medium or semibold
- More spacing above than below

---

### Tier 2 — Subsections
Applies to:
- Significance
- Provenance
- Modifications
- WOOD & CONSTRUCTION
- DIMENSIONS
- ELECTRONICS
- HARDWARE & FINISH

Requirements:
- Manrope
- Smaller than Tier 1
- Lighter weight
- Reduced vertical spacing

Tier 1 and Tier 2 must be visually distinguishable at a glance.

---

## 7. Narrative Body Text

Applies to:
- Significance
- Provenance
- Modifications
- Timeline descriptions

Requirements:
- Inter
- Increase font size by **+1–2px**
- Increase line-height for long reading
- Must be more readable than specs text

---

## 8. Specifications Section

### Layout
- Strict 2-column definition list
  - Left: label
  - Right: value

### Typography
- Labels:
  - Manrope
  - Smaller than values
  - Lower contrast
  - Never bold
- Values:
  - Inter
  - Medium weight allowed
  - Numeric fragments may use JetBrains Mono

### Section Headers (WOOD, DIMENSIONS, etc.)
- Manrope
- Uppercase
- Slightly larger than spec rows
- Subtle background strip
- Less spacing above, more below

Specs must feel **quieter than narrative text**.

---

## 9. Provenance Timeline Typography

### Dates
- JetBrains Mono
- Smaller than event titles
- Lower contrast

### Event Titles
- Manrope
- Medium or semibold
- Slightly larger than current
- Must be more prominent than dates

### Descriptions
- Inter
- Same size as narrative body (or slightly smaller)
- Increased line-height

---

## 10. Timeline Vertical Rhythm

- Increase vertical spacing between entries by **20–30%**
- Dot-to-dot spacing must be consistent
- Timeline should scan vertically without reading paragraphs

---

## 11. Right-Rail Summary Card

### Labels
- Manrope
- Smaller than values

### Values
- Inter by default
- Numeric values (price, counts): JetBrains Mono
- Currency symbol (`$`): Inter, slightly smaller

### Status pills
- Use either Manrope or JetBrains Mono
- Must be consistent across the page

Card must be scannable in **under 2 seconds**.

---

## 12. JetBrains Mono Styling Rules

- Always **1 size step smaller** than surrounding text
- Never bold unless displaying a primary identifier
- Slightly increased letter-spacing at small sizes

---

## 13. Acceptance Criteria

- Instrument title is visually dominant
- Section hierarchy is unambiguous without reading
- Narrative text is comfortable for long reading
- Specs and timeline are scannable and calm
- JetBrains Mono appears only where data is factual and attestable
- Page reads as archival documentation, not a product UI

---

End of handoff.