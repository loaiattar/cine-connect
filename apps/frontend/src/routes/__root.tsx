import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Error404 } from "./-Error404";
import { RootLayout } from "./-RootLayout";

export const Route = createRootRoute({
  notFoundComponent: Error404,
  component: () => (
    <>
      <RootLayout />
      <div className="hidden md:block">
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </>
  ),
});
