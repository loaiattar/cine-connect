import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Marquee } from "@/components/ui/marquee";
import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
    component: () => (
        <div className="dark">
            <div className="min-h-screen bg-background text-foreground antialiased flex flex-col items-center justify-center overflow-hidden">

                <div className="text-center mb-10">
                    <h1 className="text-6xl font-black tracking-tighter mb-4 italic">
                        Ciné<span className="text-primary">Connect</span>
                    </h1>
                    <p className="text-muted-foreground text-lg italic">Experience cinema like never before.</p>
                </div>

                <div className="w-full max-w-5xl">
                    <Marquee pauseOnHover className="[--duration:30s] gap-6">
                        {["Inception", "Interstellar", "The Dark Knight", "The Prestige", "Dunkirk", "Oppenheimer"].map((title) => (
                            <div
                                key={title}
                                className="bg-card px-8 py-4 rounded-2xl border border-border text-card-foreground text-xl font-bold shadow-2xl"
                            >
                                {title}
                            </div>
                        ))}
                    </Marquee>
                </div>

                <div className="flex gap-4 mt-12">
                    <Button size="lg" className="rounded-full px-8 font-bold">Watch Now</Button>
                    <Button variant="outline" size="lg" className="rounded-full px-8 font-bold border-primary text-primary hover:bg-primary/10">Explore</Button>
                </div>

                <div className="mt-10">
                    <Outlet />
                </div>

                <TanStackRouterDevtools position="bottom-right" />
            </div>
        </div>
    ),
})