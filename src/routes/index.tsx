import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Clock, Award } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import heroImg from "@/assets/hero-barbershop.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blade & Co — Barbearia urbana com estilo" },
      { name: "description", content: "Cortes e luzes com acabamento profissional. Agende online em segundos." },
      { property: "og:title", content: "Blade & Co — Barbearia urbana" },
      { property: "og:description", content: "Cortes e luzes com acabamento profissional." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Estilo. Atitude. Precisão.
            </div>
            <h1 className="text-5xl font-bold leading-none tracking-tight md:text-7xl lg:text-8xl">
              SEU VISUAL,<br />
              <span className="text-gradient-primary">NA NAVALHA</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Barbearia urbana especializada em cortes modernos e luzes com acabamento impecável.
              Agende seu horário em segundos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/agendar">
                <Button size="lg" className="bg-gradient-primary shadow-red text-base font-semibold">
                  Agendar agora
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-base">
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Nossos serviços</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">A NAVALHA CERTA PRA VOCÊ</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <ServiceCard
            icon={<Scissors className="h-8 w-8" />}
            title="Corte"
            price="25"
            description="Corte profissional com máquina e tesoura, finalização e contorno."
          />
          <ServiceCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Luzes"
            price="65"
            description="Mechas e luzes com técnica refinada para realçar o seu estilo."
          />
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="border-y border-border/50 bg-card/30 py-16">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
          <Feature icon={<Clock />} title="Agendamento online" desc="Marque seu horário em poucos cliques." />
          <Feature icon={<Award />} title="Profissionais TOP" desc="Barbeiros experientes e atualizados." />
          <Feature icon={<Sparkles />} title="Ambiente urbano" desc="Música, atitude e acabamento de cinema." />
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Blade & Co Barbearia
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, price, description }: { icon: React.ReactNode; title: string; price: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-red">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
      <div className="relative">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-red">
          {icon}
        </div>
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-5xl font-bold text-gradient-primary">{price}</span>
          <span className="text-sm text-muted-foreground">,00</span>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
