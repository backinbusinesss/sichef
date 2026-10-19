import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Reveal } from "@/components/Reveal";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("loading");
    try {
      await api.post("/api/newsletter", { email });
      setState("done");
      setMessage("Grazie! Sei nella nostra lista.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Iscrizione non riuscita.");
    }
  };

  return (
    <section className="bg-paper-2/70 py-16 md:py-20">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-cream md:px-12 md:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-ember/15 blur-[80px]"
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="eyebrow eyebrow-light">Resta in contatto</span>
                <h2 className="mt-4 text-[clamp(2.1rem,4.2vw,3.6rem)]">
                  Novità, menù e
                  <br />
                  <span className="display-italic text-ember">inviti speciali.</span>
                </h2>
                <p className="mt-4 max-w-md text-[0.85rem] leading-relaxed text-cream/50">
                  Iscriviti alla newsletter: ti raccontiamo i piatti del momento, le serate e le
                  iniziative del Sì Chef. Niente spam, solo cose buone.
                </p>
              </div>

              <div className="lg:col-span-6">
                <form onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row">
                  <label className="relative flex-1">
                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/35" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="La tua email"
                      className="field field-dark h-full py-3.5 pl-11"
                      aria-label="Email per la newsletter"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="btn btn-gold shrink-0"
                  >
                    {state === "loading" ? "Invio..." : "Iscriviti"}
                    <ArrowRight className="size-3.5" />
                  </button>
                </form>
                {message && (
                  <p
                    className={`mt-3 text-[0.72rem] ${
                      state === "error" ? "text-red-300" : "text-emerald-300"
                    }`}
                  >
                    {message}
                  </p>
                )}
                <p className="mt-4 text-[0.62rem] leading-relaxed text-cream/30">
                  Oppure entra nel{" "}
                  <Link to="/fedelta" className="text-ember underline underline-offset-4">
                    programma fedeltà
                  </Link>
                  : 1 punto per ogni euro speso e 10 € di sconto ogni 100 punti.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
