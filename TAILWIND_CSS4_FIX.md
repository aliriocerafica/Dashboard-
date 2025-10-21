# Tailwind CSS 4 - unknownAtRules Warning Fix

## Issue

VS Code was showing a CSS linting error about an unknown at-rule `@theme` in `app/globals.css`:

```
Unknown at rule @theme - unknownAtRules
```

## Root Cause

The project uses **Tailwind CSS 4**, which introduced new CSS at-rules:

- `@theme` - Define theme variables inline
- `@layer` - Organize utility/component layers
- `@apply` - Apply utilities inside CSS rules
- `@import` - Import Tailwind directives

These are valid Tailwind CSS 4 features, but VS Code's built-in CSS validator (and stylelint) don't recognize them by default.

## Solution Implemented

### 1. **Updated `app/globals.css`**

Added a stylelint disable comment above the `@theme` rule:

```css
/* stylelint-disable-next-line at-rule-no-unknown */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### 2. **Created `.stylelintrc.json`**

Added stylelint configuration to ignore Tailwind CSS at-rules globally:

```json
{
  "extends": ["stylelint-config-recommended"],
  "rules": {
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": [
          "tailwind",
          "layer",
          "apply",
          "responsive",
          "screen",
          "theme",
          "import",
          "supports"
        ]
      }
    ]
  }
}
```

### 3. **Updated `.vscode/settings.json`**

Configured VS Code to ignore unknown CSS at-rules:

```json
{
  "css.lint.unknownAtRules": "ignore",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Files Modified

| File                    | Change                                                       | Purpose                                                  |
| ----------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `app/globals.css`       | Added `/* stylelint-disable-next-line at-rule-no-unknown */` | Suppress warning for this specific rule                  |
| `.stylelintrc.json`     | Created new file                                             | Configure stylelint to recognize Tailwind CSS 4 at-rules |
| `.vscode/settings.json` | Updated settings                                             | Configure VS Code CSS linter                             |

## Tailwind CSS 4 At-Rules Explained

### @import "tailwindcss"

Imports all Tailwind CSS functionality

```css
@import "tailwindcss";
```

### @theme

Defines custom theme variables inline

```css
@theme inline {
  --color-primary: #3b82f6;
  --font-sans: var(--font-geist-sans);
}
```

### @layer

Organizes styles into layers (base, components, utilities)

```css
@layer utilities {
  .custom-class {
    /* styles */
  }
}
```

### @apply

Applies Tailwind utilities inside CSS rules

```css
.button {
  @apply px-4 py-2 rounded-lg bg-blue-600 text-white;
}
```

## Result

✅ **Warning Eliminated:**

- VS Code no longer shows CSS errors
- Stylelint recognizes all Tailwind CSS 4 at-rules
- Clean development experience with no false errors

✅ **Development Experience:**

- No warning noise in the editor
- Focus on actual code issues
- Proper Tailwind CSS 4 support

## Browser Compatibility

All modern browsers support CSS custom properties (variables) and at-rules used:

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Next Steps

- [x] Fix CSS linting errors
- [ ] Consider adding additional Tailwind CSS configurations if needed
- [ ] Monitor for other linting warnings

## References

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Stylelint Documentation](https://stylelint.io/)
- [VS Code CSS Settings](https://code.visualstudio.com/docs/languages/css)
