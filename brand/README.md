# SoftlyPlease Brand Kit

- Tokens: `brand/tokens.json`
- CSS variables: `brand/theme.css`

Usage (HTML):
```html
<link rel="stylesheet" href="/brand/theme.css" />
```

Usage (React):
```tsx
import './brand/theme.css'

export function PrimaryButton(props: React.PropsWithChildren) {
  return <button className="brand-button">{props.children}</button>
}
```
