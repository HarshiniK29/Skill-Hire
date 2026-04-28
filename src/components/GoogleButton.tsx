import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const { signInWithGoogle } = useAuth();
  return (
    <Button
      size="lg"
      className="gap-3 bg-foreground text-background hover:bg-foreground/90"
      onClick={async () => {
        try {
          await signInWithGoogle();
        } catch (e) {
          toast.error("Could not start Google sign-in");
          console.error(e);
        }
      }}
    >
      <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.1z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.6 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </Button>
  );
}
