import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/LoginPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/LoginPage"!</div>
}
