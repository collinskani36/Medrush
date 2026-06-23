import { createFileRoute } from "@tanstack/react-router";

// TanStack shell — the actual app is rendered by React Router inside __root.tsx.
export const Route = createFileRoute("/")({
  component: () => null,
});
