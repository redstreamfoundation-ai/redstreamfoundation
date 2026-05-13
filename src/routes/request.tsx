import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequestProvider } from "@/lib/request-store";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "Request emergency blood — Redstream Foundation" },
      {
        name: "description",
        content:
          "Submit a verified emergency blood request and get matched with nearby donors across Delhi.",
      },
    ],
  }),
  component: () => (
    <RequestProvider>
      <Outlet />
    </RequestProvider>
  ),
});