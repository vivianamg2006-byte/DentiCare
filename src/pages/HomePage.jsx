import { CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-primary/10 p-6 md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/30 blur-3xl" />

            <Card className="relative border-border/60 bg-card/80 shadow-xl backdrop-blur">
                <CardContent className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Plataforma tecnológica de eventos
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                                Sistema de{" "}
                                <span className="text-primary">Eventos</span>
                            </h1>

                            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                                Gestiona, consulta e inscríbete en eventos tecnológicos
                                de forma rápida, moderna y organizada.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button size="lg" className="group" asChild>
                                <Link to="/events">
                                    Ver eventos
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" asChild>
                                <Link to="/create">
                                    Crear evento
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-sm rounded-2xl border bg-background/80 p-6 shadow-md">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <CalendarDays className="h-7 w-7 text-primary" />
                            </div>

                            <h2 className="mb-2 text-xl font-semibold">
                                Próximos eventos
                            </h2>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Explora charlas, talleres, conferencias y actividades
                                relacionadas con desarrollo web, inteligencia artificial
                                y tecnología.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}