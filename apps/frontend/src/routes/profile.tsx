import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for `/profile` (index = my profile, `/$userId` = public profile).
 * Child routes render in `<Outlet />`; without this, `/profile/:id` incorrectly showed the index page.
 */
export const Route = createFileRoute("/profile")({
  component: () => <Outlet />,
});
