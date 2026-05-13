import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/donor/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/donor/dashboard"!</div>
}
