# Clean auth landing, clickable country resources, and a more engaging look

## 1. No app chrome on the sign-in page

Right now the sidebar and the "Eleva / Personal OS" header wrap every page, including sign-in — so a first-time visitor sees a half-built app behind the login form.

- The root layout will render app chrome only for in-app routes. `/auth` (and the 404 page) render full-bleed, with no sidebar and no top bar.
- The sign-in page becomes a proper landing: two-panel on desktop (brand/value panel with a soft gradient on the left, sign-in card on the right), single centered card on mobile.
- Copy gets tightened: product name, one-line promise, three short value points (academics, money, visa & career), then Google + email sign-in and the "Take a 5-minute tour" link.

## 2. International resources become real links

Each country resource is currently just a name and a note. Every entry gets a real URL and becomes a clickable card that opens the official site in a new tab (with an external-link icon and hover state).

Links to add:

- Australia — Home Affairs VEVO, ATO (TFN/returns), Fair Work Ombudsman, Study Australia
- Canada — IRCC study permit, CRA international students
- United Kingdom — UKVI Student route, HMRC student tax
- United States — SEVP/Study in the States F-1, IRS Form 8843

I'll also add a couple of extra useful entries per country (e.g. health cover / national insurance) so the panel doesn't look thin.

## 3. Colour and layout polish

Keeping Cloud White + Space Grotesk/DM Sans, but raising the craft:

- **Depth instead of flatness**: soft layered shadows and a subtle tinted surface for cards, so sections read as panels rather than boxes on white.
- **Accent discipline**: one blue accent for primary actions and progress; amber for "due soon"; red only for overdue/over-limit. Countdown cards get a coloured left edge so urgency is scannable.
- **Page headers**: every page gets a consistent header block (eyebrow, title, one-line subtitle) and the top bar shows the actual section name instead of a static "Personal OS".
- **Density and rhythm**: consistent card padding, section spacing, and a max content width so wide screens don't stretch.
- **Empty states**: lists that are empty currently show nothing; they'll show a short prompt plus the action that fills them.
- **Motion**: 150–200ms hover/press transitions on cards and buttons; nothing bouncy.

## Technical notes

- `src/routes/__root.tsx`: split the shell — read the pathname via `useRouterState` and render either the sidebar shell or a bare `<Outlet />` for `/auth`. `PreviewGate` stays wrapped around in-app routes only.
- `src/routes/auth.tsx`: restructure into the two-panel landing; no logic changes to the Supabase sign-in flow or the preview timer.
- `src/lib/life-store.ts`: add `url` to the `COUNTRY_RESOURCES` entry shape; `src/routes/international.tsx` renders each as an `<a target="_blank" rel="noopener noreferrer">`.
- Visual tokens (surface, shadow layers, urgency colours) go in `src/styles.css` as semantic tokens; components use tokens only, no hardcoded colours.
