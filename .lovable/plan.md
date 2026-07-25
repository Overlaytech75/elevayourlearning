## Problem
On mobile, opening the sidebar and tapping a nav item navigates to the new section but the sidebar sheet stays open, covering the content. You want it to auto-close (return to its previous collapsed/closed state) once navigation happens.

## Fix
Update `src/components/app-sidebar.tsx` so each `SidebarMenuButton` closes the sidebar after a nav link is tapped on mobile.

### Technical details
- Use the `useSidebar()` hook from `@/components/ui/sidebar` to read `isMobile` and `setOpenMobile`.
- On each `<Link>`'s `onClick`, if `isMobile` is true, call `setOpenMobile(false)` so the Sheet closes right after route change.
- Desktop behavior is unchanged (the icon-collapsible sidebar stays as the user left it).

No other files need changes.