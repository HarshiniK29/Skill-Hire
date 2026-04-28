import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export function SiteHeader() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" aria-label="Skill-Hire home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => signInWithGoogle().catch(console.error)}>
              Continue with Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
