import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/GoogleButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  file_name: string;
  score: number;
  created_at: string;
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("resume_analyses")
      .select("id, file_name, score, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("resume_analyses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      setRows((r) => r.filter((x) => x.id !== id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <SiteHeader />
        <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl font-bold">Sign in to view your reports</h1>
          <GoogleButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <div className="container max-w-4xl py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your reports</h1>
            <p className="mt-2 text-muted-foreground">All analyses tied to {user.email}</p>
          </div>
          <Link to="/upload">
            <Button className="bg-gradient-hero text-primary-foreground shadow-elegant hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> New analysis
            </Button>
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Upload your first resume to get started.</p>
            <Link to="/upload" className="mt-6 inline-block">
              <Button>Upload a resume</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-3xl border border-border/60 bg-card shadow-card">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 p-5">
                <Link to={`/results/${r.id}`} className="flex flex-1 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold tabular-nums ${
                        r.score >= 80
                          ? "text-success"
                          : r.score >= 60
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {r.score}
                    </p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(r.id)}
                  aria-label="Delete report"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
