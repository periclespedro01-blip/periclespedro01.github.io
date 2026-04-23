import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Scissors, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span className="font-display text-2xl tracking-wider">
            BLADE<span className="text-primary">&</span>CO
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="hidden text-sm font-medium hover:text-primary sm:inline">
            Início
          </Link>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Painel Admin</Button>
                </Link>
              ) : (
                <Link to="/agendar">
                  <Button variant="outline" size="sm">Meus Agendamentos</Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-primary shadow-red">Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
