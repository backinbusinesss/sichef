import { Link } from "react-router-dom";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="relative grid min-h-[80svh] place-items-center overflow-hidden bg-cream px-6 pt-24 pb-16">
      <div aria-hidden="true" className="pointer-events-none absolute top-10 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />
      <div className="relative text-center">
        <p className="font-display text-[clamp(6rem,20vw,14rem)] leading-none text-ink/8">404</p>
        <span className="mx-auto -mt-6 grid size-12 place-items-center rounded-full bg-flame/10 text-flame"><UtensilsCrossed className="size-5" /></span>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)]">Questa pagina non è nel menu.</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.88rem] leading-relaxed text-ink/50">
          Forse è finita in cucina. Torna alla home e riparti da qualcosa di buono.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className="btn btn-clay"><ArrowLeft className="size-4" /> Torna alla home</Link>
          <Link to="/menu" className="btn btn-ghost">Sfoglia il menu</Link>
        </div>
      </div>
    </section>
  );
}
