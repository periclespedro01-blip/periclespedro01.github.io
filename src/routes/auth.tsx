import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Scissors } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar | Blade & Co" }] }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o usuário ou e-mail").max(255),
  password: z.string().min(1, "Informe a senha").max(72),
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: isAdmin ? "/admin" : "/agendar" });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let identifier = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    // Permite usar "usuario" como atalho para admin de fábrica
    if (identifier && !identifier.includes("@")) {
      identifier = `${identifier}@barbearia.local`;
    }

    const parsed = loginSchema.safeParse({ email: identifier, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
    setBusy(false);
    if (error) {
      toast.error("Credenciais inválidas");
      return;
    }
    toast.success("Bem-vindo!");
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    const parsed = signupSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: parsed.data.full_name, phone: parsed.data.phone },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cadastro realizado! Você já pode entrar.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Scissors className="h-7 w-7 text-primary" strokeWidth={2.5} />
          <span className="font-display text-3xl tracking-wider">
            BLADE<span className="text-primary">&</span>CO
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="login-email">Usuário ou e-mail</Label>
                  <Input id="login-email" name="email" placeholder="seu@email.com" required />
                </div>
                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary shadow-red">
                  {busy ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="su-name">Nome completo</Label>
                  <Input id="su-name" name="full_name" required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="su-phone">Telefone</Label>
                  <Input id="su-phone" name="phone" placeholder="(11) 99999-9999" required maxLength={20} />
                </div>
                <div>
                  <Label htmlFor="su-email">E-mail</Label>
                  <Input id="su-email" name="email" type="email" required maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="su-password">Senha</Label>
                  <Input id="su-password" name="password" type="password" required minLength={6} maxLength={72} />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary shadow-red">
                  {busy ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
