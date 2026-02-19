import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="dark min-h-screen bg-black text-white">
      <main>
        <Outlet />
      </main>
      <div className="hidden md:block">
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </div>
  ),
});
