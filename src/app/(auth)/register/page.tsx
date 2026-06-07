import ThemeToggle from "@/components/ThemeToggle";
import { getSetting } from "@/lib/settings";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const codeRequired = (await getSetting("registerCode")).trim().length > 0;

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">🏆</div>
        <h1 className="display text-4xl font-black tracking-tight">
          FIFA<span className="gradient-text">PRONO</span>
          <span className="text-muted"> 26</span>
        </h1>
        <p className="mt-2 text-muted">Rejoins le groupe et lance tes pronos !</p>
      </div>

      <RegisterForm codeRequired={codeRequired} />
    </main>
  );
}
