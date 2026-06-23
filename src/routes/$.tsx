import { createFileRoute } from "@tanstack/react-router";

// Catch-all so deep links like /products/:id, /admin, /order/:id render
// the React Router app mounted in __root.tsx instead of TanStack's 404.
export const Route = createFileRoute("/$")({
  component: () => null,
});
