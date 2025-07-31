## **Color Palette**

### **Primary Colors**
- **Main CTA/Primary**: `#4A5D23` (Deep Forest Green) - Serious, professional, less bright than typical web colors
  - **Hover State**: `#3A4A1B` (Darker forest green)
  - **Light Variant**: `#E8EDE0` (For subtle backgrounds/borders)

### **Neutral Colors**
- **Text Primary**: `#1A1A1A` (Near black for high contrast reading)
- **Text Secondary**: `#4A4A4A` (Medium gray for supporting text)
- **Text Muted**: `#757575` (Light gray for metadata/timestamps)
- **Background**: `#FAFAFA` (Warm white, easier on eyes than pure white)
- **Card Background**: `#FFFFFF` (Pure white for cards to create separation)
- **Border Light**: `#E5E5E5` (Subtle dividers)
- **Border Medium**: `#D4D4D4` (More prominent borders)

### **Status/Badge Colors** (Traffic Light System)
- **Success/Green**: `#16A34A` (Clear green for verified/excellent status)
- **Warning/Yellow**: `#EAB308` (Clear yellow for pending/caution)
- **Error/Red**: `#DC2626` (Clear red for issues/disputes)
- **Info/Blue**: `#2563EB` (For informational badges)

## **Typography System**

### **Brand/Display Font**
- **Special Elite** - Reserved exclusively for:
  - Main site title "Electric Guitar Registry"
  - Major section headers when brand identity is important
  - Serial number displays (to reinforce the stamped/engraved aesthetic)

### **Primary Text Font Stack**
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
**Inter** provides:
- Excellent readability at all sizes
- Clean, professional appearance
- Great number rendering (important for specs/dates)
- Subtle personality without being distracting

### **Monospace Font** (for technical data)
```css
font-family: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace;
```
For:
- Serial numbers
- Model numbers
- Technical specifications
- Code/ID references

## **Typography Scale**
- **H1 (Page Title)**: 32px/40px - Special Elite (brand contexts) or Inter Bold
- **H2 (Section Headers)**: 24px/32px - Inter Bold
- **H3 (Subsection)**: 20px/28px - Inter SemiBold
- **H4 (Card Titles)**: 18px/24px - Inter SemiBold
- **Body Large**: 16px/24px - Inter Regular
- **Body**: 14px/20px - Inter Regular
- **Small**: 12px/16px - Inter Regular
- **Tiny**: 11px/16px - Inter Medium (for badges/labels)

## **Design System Details**

### **Rounded Corners**
- **Subtle**: 4px (cards, buttons, inputs)
- **Medium**: 6px (larger cards, modals)
- **Badges**: 12px (pill-shaped)

### **Shadows**
- **Card**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Hover**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Modal**: `0 20px 25px rgba(0, 0, 0, 0.1)`

### **Spacing Scale** (based on 4px grid)
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## **Implementation Notes**

1. **Accessibility**: The color palette ensures WCAG AA compliance with sufficient contrast ratios
2. **Photo Priority**: The muted color scheme ensures guitar photos remain the visual focal point
3. **Content Hierarchy**: Typography scale supports dense information while maintaining scanability
4. **Status Indicators**: Traffic light colors are immediately recognizable across cultures
5. **Professional Feel**: The forest green primary color conveys trust and permanence while being less aggressive than bright blues or oranges

This system creates a Wikipedia-like clarity with more sophisticated typography and a color scheme that honors the serious, archival nature of guitar documentation while maintaining modern usability standards.

## Implemenation strategy

- Load fonts from Google fonts
- Currently, Geist is not being loaded, fontsdefault to ui-sans-serif in chrome. Replace with Inter.
- Treatment for the brand is: use font special Elite for the brand name in the header.
- Convert the PRD hex colors to OKLCH values
- Dark mode: Keep support and don't change any values yet. ONce the light mode palette is implemented and tested, we may need to adjust before defining the dark mode palette.
- Implement al lthe changes replacing the current design system. A branch has been created for this just in case.
- Update the Tailwind config to include the new colors and fonts
- Anything in the current implementation that is not in the PRD and does not conflict with the requirements should stay as it is. Report if anything was left that may require a change or is not needed.