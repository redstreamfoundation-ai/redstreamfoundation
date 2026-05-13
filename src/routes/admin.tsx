import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminShell,
  head: () => ({
    meta: [
      { title: "Operations · Redstream Foundation" },
      { name: "description", content: "Emergency coordination command center." },
    ],
  }),
});