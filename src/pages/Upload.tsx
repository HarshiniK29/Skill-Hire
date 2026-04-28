import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { GoogleButton } from "@/components/GoogleButton";
import { extractTextFromFile } from "@/lib/parseResume";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Loader2, Upload as UploadIcon } from "lucide-react";

export default function Upload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string>("");

  const handleFile = useCallback(
    async (file: File) => {
      if (!user) {
        toast.error("Please sign in first.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("File too large. Max 8 MB.");
        return;
      }
      try {
        setBusy(true);
        setStage("Extracting text from your resume…");
        const text = await extractTextFromFile(file);
        if (text.length < 80) {
          throw new Error("We couldn't read enough text from this file.");
        }

        setStage("Running ATS analysis with AI…");
        const { data, error } = await supabase.functions.invoke("analyze-resume", {
          body: { resumeText: text, fileName: file.name },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setStage("Saving your report…");
        const { data: inserted, error: insErr } = await supabase
          .from("resume_analyses")
          .insert({
            user_id: user.id,
            file_name: file.name,
            resume_text: text,
            score: data.score,
            summary: data.summary,
            strengths: data.strengths ?? [],
            weaknesses: data.weaknesses ?? [],
            suggestions: data.suggestions ?? [],
            keywords_found: data.keywords_found ?? [],
            keywords_missing: data.keywords_missing ?? [],
          })
          .select("id")
          .single();
        if (insErr) throw insErr;

        toast.success("Analysis ready!");
        navigate(`/results/${inserted.id}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        toast.error(msg);
        console.error(e);
      } finally {
        setBusy(false);
        setStage("");
      }
    },
    [user, navigate]
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold">Sign in to analyze your resume</h1>
          <p className="max-w-md text-muted-foreground">
            We sync everything to your Google account so your reports stay with you.
          </p>
          <GoogleButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <div className="container max-w-3xl py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Upload your resume</h1>
        <p className="mb-10 text-muted-foreground">
          PDF, DOCX, or TXT. We'll score it against ATS rules and suggest concrete improvements.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center transition ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/60"
          } ${busy ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {busy ? (
            <>
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-semibold">{stage}</p>
              <p className="mt-2 text-sm text-muted-foreground">This usually takes 5–15 seconds.</p>
            </>
          ) : (
            <>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant">
                <UploadIcon className="h-7 w-7" />
              </div>
              <p className="text-lg font-semibold">Drop your resume here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
              <Button type="button" className="mt-6 bg-gradient-hero text-primary-foreground shadow-elegant hover:opacity-95">
                <FileText className="mr-2 h-4 w-4" />
                Choose file
              </Button>
              <p className="mt-6 text-xs text-muted-foreground">PDF · DOCX · TXT · max 8 MB</p>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
