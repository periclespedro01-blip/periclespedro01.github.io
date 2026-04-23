import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Scissors, Sparkles, Calendar as CalIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/agendar")({
  head: () => ({ meta: [{ title: "Meus Agendamentos | Blade & Co" }] }),
  component: AgendarPage,
});

type Service = "corte" | "luzes";
const SERVICES: Record<Service, { label: string; price: number; icon: React.ReactNode }> = {
  corte: { label: "Corte", price: 25, icon: <Scissors className="h-5 w-5" /> },
  luzes: { label: "Luzes", price: 65, icon: <Sparkles className="h-5 w-5" /> },
};

type Appointment = {
  id: string;
  service: string;
  price: number;
  appointment_at: string;
  status: string;
};

function AgendarPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service>("corte");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [appts, setAppts] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_at", { ascending: false });
    setAppts((data as Appointment[]) || []);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date || !time) {
      toast.error("Escolha data e hora");
      return;
    }
    const at = new Date(`${date}T${time}`);
    if (isNaN(at.getTime()) || at < new Date()) {
      toast.error("Selecione uma data futura");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      service,
      price: SERVICES[service].price,
      appointment_at: at.toISOString(),
    });
    setBusy(false);
    if (error) {
      toast.error("Erro ao agendar");
      return;
    }
    toast.success("Agendamento confirmado!");
    setDate("");
    setTime("");
    load();
  };

  const cancel = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error("Erro ao cancelar");
    else {
      toast.success("Agendamento cancelado");
      load();
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-4xl font-bold md:text-5xl">AGENDAR HORÁRIO</h1>
        <p className="mt-2 text-muted-foreground">Escolha o serviço e o melhor horário pra você.</p>

        <Card className="mt-8 border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="mb-3 block">Serviço</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(SERVICES) as Service[]).map((k) => {
                  const s = SERVICES[k];
                  const active = service === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setService(k)}
                      className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 shadow-red"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}>
                          {s.icon}
                        </div>
                        <div>
                          <div className="font-bold">{s.label}</div>
                          <div className="text-sm text-muted-foreground">R$ {s.price},00</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="time">Hora</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary shadow-red">
              {busy ? "Agendando..." : "Confirmar agendamento"}
            </Button>
          </form>
        </Card>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">SEUS AGENDAMENTOS</h2>
          <div className="mt-4 space-y-3">
            {appts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Nenhum agendamento ainda.
              </p>
            ) : (
              appts.map((a) => (
                <Card key={a.id} className="flex items-center justify-between border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold capitalize">{a.service} — R$ {Number(a.price).toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(a.appointment_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                      {a.status}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => cancel(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
