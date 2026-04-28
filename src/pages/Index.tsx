import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/GoogleButton";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, FileSearch, Sparkles, Target, Upload, Zap } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Deep ATS scan",
    desc: "Instantly see how a real applicant tracking system reads your resume.",
  },
  {
    icon: Target,
    title: "Pinpointed fixes",
    desc: "Get line-level suggestions to raise your score and beat the bots.",
  },
  {
    icon: Zap,
    title: "Powered by AI",
    desc: "Latest Gemini reasoning extracts strengths, gaps and missing keywords.",
  },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />

      {/* Hero */}
      <section className="container relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-card backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered ATS resume checker
          </div>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Land more interviews with a{" "}
            <span className="text-gradient">resume that ranks</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Skill-Hire scans your resume against modern ATS rules and gives you the
            exact rewrites to get past the screening bots — in seconds.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-hero text-primary-foreground shadow-elegant hover:opacity-95">
                  <Upload className="mr-2 h-5 w-5" /> Upload your resume
                </Button>
              </Link>
            ) : (
              <GoogleButton label="Sign in with Google to start" />
            )}
            <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How it works →
            </a>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No password. Synced to your Google account automatically.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="container pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-7 shadow-card transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center text-primary-foreground shadow-elegant sm:p-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <h2 className="text-3xl font-bold sm:text-4xl">Three steps to a stronger resume</h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-3">
            {["Sign in with Google", "Upload your resume", "Get your score & fixes"].map((s, i) => (
              <div key={s} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium opacity-80">Step {i + 1}</span>
                </div>
                <p className="font-semibold">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Skill-Hire. Built for job seekers.
      </footer>
    </div>
  );
}
