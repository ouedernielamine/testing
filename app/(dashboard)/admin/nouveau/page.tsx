import { AdminChapitreForm } from "@/components/admin-chapitre-form";

export const dynamic = "force-dynamic";

export default function NewChapitrePage() {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-gold mb-2">
          Création
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Nouveau chapitre
        </h1>
      </div>
      <AdminChapitreForm />
    </>
  );
}
