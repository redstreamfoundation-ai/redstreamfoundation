import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DonorProvider } from "@/lib/donor-store";

export const Route = createFileRoute("/donor")({
  component: DonorLayout,
});

function DonorLayout() {
  return (
    <DonorProvider>
      <Outlet />
    </DonorProvider>
  );
}