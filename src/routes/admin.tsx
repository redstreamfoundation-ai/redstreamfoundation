import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminShell,
  head: () => ({
    meta: [
      { title: "Operations · Redstream Foundation" },
      {
        name: "description",
        content:
          "Internal Redstream operations console for verifying requests, monitoring live donor matching, and coordinating emergency blood responses across Delhi NCR.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});