import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <div className="p-2">
            <h3>Welcome to CineConnect!</h3>
            <p className="text-blue-500">This is a test of Tailwind CSS</p>
        </div>
    )
}
