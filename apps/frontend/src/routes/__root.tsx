import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Error404 } from "./-Error404";

export const Route = createRootRoute({
  notFoundComponent: Error404,
  component: () => (
    <div className="min-h-dvh bg-background text-foreground">
      <main>
        <Outlet />
      </main>
      <div className="hidden md:block">
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </div>
  ),
});
