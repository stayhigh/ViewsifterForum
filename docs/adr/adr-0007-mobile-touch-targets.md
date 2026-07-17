# ADR-0007: Minimum 44px Touch Targets for Mobile

**Date:** 2026-07-17
**Status:** Accepted

## Context

Mobile users reported being unable to tap the like button (❤️/🤍) on topic pages. The button was functionally correct (form POST → API toggle) but physically untappable on touchscreens.

## Diagnosis

The like button's CSS had:
- `font-size: inherit` (0.85rem = ~13.6px)
- `padding: 0`
- No minimum dimensions

The emoji rendered at ~12px, far below the **44px minimum touch target** recommended by WCAG 2.1 (Success Criterion 2.5.5) and enforced by iOS/macOS Human Interface Guidelines.

Mobile users' fingers (average ~40-50px touch area) completely covered the tiny button. Combined with adjacent text ("2026年7月17日 · 🤍 0"), taps were likely being routed to the surrounding `<time>` or `<span>` elements instead of the `<button>`.

## Decision

Set **minimum 44px touch targets** on all interactive elements in the topic view:

| Element | Before | After |
|---|---|---|
| `.btn-like` | ~12×12px, `font-size: inherit`, no padding | `min-width: 44px`, `min-height: 44px`, `font-size: 1.05rem`, `padding: 0 0.25rem`, `display: inline-flex` |
| `.btn-reply` | ~30px height | `min-height: 44px`, `display: inline-flex` |

## Consequences

- **Positive**: Mobile users can now reliably tap like/reply buttons. Better a11y compliance.
- **Negative**: Slightly larger buttons in the article header. Wabi-Sabi aesthetic preserved (minimal disruption — `background: none`, `border: none` maintained).
- **Future**: All new interactive UI elements in ViewsForum should default to 44px minimum tap target.

## References

- WCAG 2.1 SC 2.5.5: Target Size (Minimum)
- Apple HIG: "Buttons should have a minimum tappable area of 44×44 points"
- PR TS-06: Likes — verified on desktop and mobile after fix
