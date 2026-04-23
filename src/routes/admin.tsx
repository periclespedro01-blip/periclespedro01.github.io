import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin | Blade & Co" }] }),
  component: AdminPage,
});

type Row = {
  id: string;
  user_id: string;
  service: string;
  price: number;
  appointment_at: string;
  status: string;
  profile?: { full_name: string | null; phone: string | null };
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/agendar" });
  }, [user, isAdmin, loading, navigate]);

  const load = async () => {
    setFetching(true);
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_at", { ascending: false });

    const userIds = [...new Set((appts || []).map((a) => a.user_id))];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", userIds)
      : { data: [] };

    const profMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    setRows(
      (appts || []).map((a) => ({
        ...a,
        profile: profMap.get(a.user_id) || undefined,
      })) as Row[]
    );
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error("Erro ao remover");
    else {
      toast.success("Removido");
      load();
    }
  };

  const total = rows.reduce((sum, r) => sum + Number(r.price), 0);
  const upcoming = rows.filter((r) => new Date(r.appointment_at) >= new Date()).length;
  const clients = new Set(rows.map((r) => r.user_id)).size;

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-bold md:text-5xl">PAINEL ADMIN</h1>
        <p className="mt-2 text-muted-foreground">Gerencie todos os agendamentos da barbearia.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={<Calendar />} label="Próximos" value={String(upcoming)} />
          <Stat icon={<Users />} label="Clientes" value={String(clients)} />
          <Stat icon={<DollarSign />} label="Receita prevista" value={`R$ ${total.toFixed(0)}`} />
        </div>

        <h2 className="mt-12 text-2xl font-bold">TODOS OS AGENDAMENTOS</h2>
        <div className="mt-4 space-y-3">
          {fetching ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhum agendamento ainda.
            </p>
          ) : (
            rows.map((r) => (
              <Card key={r.id} className="border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-red">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold">
                        {r.profile?.full_name || "Cliente"}{" "}
                        <span className="text-muted-foreground font-normal">
                          {r.profile?.phone ? `· ${r.profile.phone}` : ""}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="capitalize">{r.service}</span> — R$ {Number(r.price).toFixed(0)} ·{" "}
                        {new Date(r.appointment_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                      {r.status}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 border-border bg-card p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-red">
        {icon}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
