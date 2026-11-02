# Warm UI kit · Group 10 couples to-do (React)

Styles and base components taken from the Figma file "Test UI", page "10 · UI Components".
Plain CSS + React, no extra styling library.

## Install

```bash
npm i lucide-react
```

Copy `src/tokens.css` and the `src/components/` folder into your project, then import the tokens once at the root:

```jsx
import './tokens.css';
import { TaskCard, SectionHeader, TabBar, Sheet, Button, StatusChip, Avatar, AvatarPair } from './components';
```

### Fonts

`tokens.css` loads Playfair Display and DM Sans from Google Fonts. If you prefer to ship them with the app (works offline, no external requests), remove the `@import` line and use:

```bash
npm i @fontsource/dm-sans @fontsource/playfair-display
```

```js
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
```

## Rules the kit follows

- **Colour = person.** `person="a"` is the list owner (brick), `person="b"` the partner (petrol). A person keeps the same colour on both phones, so map it from the user, not from "me". `person={null}` = up for grabs.
- **Icon + label = status**, never colour alone (NFR6): `open`, `planned`, `waiting`, `rescheduled`, `done`, `clash`, `repeats`.
- **Primary buttons are warm black** (`variant="primary"`), not a person colour.
- **Playfair only for titles** (`t-screen-title`, `t-section-title`, `t-card-title`, `t-number`). Days and times use `t-digits` (DM Sans), because Playfair digits are old-style.
- **The + in the tab bar** opens the add form for the current tab: `onAdd('groceries')` should open the grocery form.
- Buttons are at least 44 px high (NFR6).

## Components

| Component | Main props |
| --- | --- |
| `Avatar` | `initial`, `person` ('a', 'b', null), `size` (24, 32, 44) |
| `AvatarPair` | `people` ([{initial, person}]), `size` |
| `StatusChip` | `status`, optional `label` |
| `Button` | `variant` ('primary', 'secondary', 'soft', 'brick'), `block`, `small` |
| `TaskCard` | `title`, `meta`, `status`, `person`, `initial`, `done`, `onToggle`, `onTake` |
| `SectionHeader` | `title`, `count` or `right` |
| `TabBar` | `active` ('home', 'tasks', 'groceries', 'us'), `onNavigate`, `onAdd` |
| `Sheet` | `title`, `onClose`, children |

## Tokens

All colours, radii, spacing and shadows are CSS variables in `tokens.css` with the same names as the Figma variables (`--bg-ivory`, `--surface-card`, `--status-open`, ...). Put `className="app-glow"` on a screen root for the warm background; change `--glow-main` and `--glow-second` to try the other colour options from Figma.
