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
      { property: "og:title", content: "Request emergency blood — Redstream Foundation" },
      {
        property: "og:description",
        content:
          "Start a verified emergency blood request in minutes and reach nearby Delhi donors through Redstream.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/request" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/request.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/request.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/request" }],
  }),
  component: () => (
    <RequestProvider>
      <Outlet />
    </RequestProvider>
  ),
});