import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, CalendarCheck, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { useContent } from "@/lib/content";

export function Hero() {
  const { content } = useContent();
  const hero = content?.settings.hero;
  const venue = content?.settings.venue;

  const title = hero?.title ?? "La tradizione ha un profumo buono.";
  const words = title.split(" ");
  const last = words.pop() ?? "";

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-cream">
      <img
        src={hero?.image ?? "/assets/img/hero.webp"}
        alt="Pizza appena sfornata da Sì Chef"
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/12" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(197,154,82,.17),transparent_52%)]" />

      <div className="shell relative flex min-h-[100svh] flex-col justify-end pt-32 pb-12 md:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="eyebrow eyebrow-light">
                {hero?.kicker ?? "Cerro Maggiore · tra Legnano e Saronno"}
              </span>
              <span className="hidden h-px w-10 bg-cream/20 sm:block" />
              <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.16em] text-cream/55 uppercase">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Aperto 7 giorni su 7
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-4xl text-[clamp(3rem,7.4vw,7.2rem)] leading-[0.91]"
            >
              {words.join(" ")}{" "}
              <span className="display-italic text-ember">{last}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.34 }}
              className="mt-7 max-w-xl text-[0.95rem] leading-relaxed text-cream/65 md:text-[1.02rem]"
            >
              {hero?.subtitle ??
                "Cucina italiana, pesce fresco, pizza dall'impasto della casa e un'accoglienza che sa di famiglia."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.44 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link to="/prenota" className="btn btn-clay btn-lg">
                <CalendarCheck className="size-4" />
                {hero?.primaryCta ?? "Prenota un tavolo"}
              </Link>
              <Link to="/menu" className="btn btn-ghost-light btn-lg">
                <UtensilsCrossed className="size-4" />
                {hero?.secondaryCta ?? "Scopri il menu"}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.68rem] font-semibold tracking-wide text-cream/50"
            >
              <span className="inline-flex items-center gap-2">
                <Star className="size-3.5 fill-ember text-ember" />
                4,3 / 5 su Tripadvisor
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-3.5 text-ember" />
                {venue?.address?.split(",")[0] ?? "Via S. Clemente 151"}
              </span>
              <span className="hidden items-center gap-2 sm:inline-flex">
                <span className="size-1 rounded-full bg-cream/30" />
                Parcheggio · Dehor · Wi-Fi
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 lg:pl-10"
          >
            <div className="ml-auto max-w-sm overflow-hidden rounded-[1.6rem] border border-cream/15 bg-ink/45 p-2 shadow-2xl backdrop-blur-md">
              <div className="relative overflow-hidden rounded-[1.2rem]">
                <img
                  src="/assets/img/pasta.webp"
                  alt="Pasta fresca della casa"
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-cream px-3 py-1.5 text-[0.55rem] font-extrabold tracking-[0.16em] text-ink uppercase">
                  Il pranzo di Sì Chef
                </span>
              </div>
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl leading-none">Pranzo completo</p>
                    <p className="mt-1.5 text-[0.68rem] leading-relaxed text-cream/50">
                      Primo, secondo, contorno, acqua o vino e caffè.
                    </p>
                  </div>
                  <p className="font-display text-3xl text-ember">13€</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-cream/10 pt-3">
                  <span className="text-[0.6rem] tracking-[0.12em] text-cream/40 uppercase">
                    Lun–Ven · 12:00–14:30
                  </span>
                  <Link
                    to="/menu-pranzo"
                    className="inline-flex items-center gap-1 text-[0.62rem] font-extrabold tracking-[0.1em] text-ember uppercase"
                  >
                    Scopri
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 flex items-center justify-between border-t border-cream/10 pt-5"
        >
          <span className="text-[0.56rem] font-bold tracking-[0.24em] text-cream/35 uppercase">
            Ristorante · Pizzeria · Pesce fresco
          </span>
          <button
            onClick={() => {
              const target = document.getElementById("storia");
              if (target) {
                window.scrollTo({
                  top: target.getBoundingClientRect().top + window.scrollY - 76,
                  behavior: "smooth",
                });
              }
            }}
            className="group inline-flex items-center gap-2 text-[0.56rem] font-bold tracking-[0.2em] text-cream/40 uppercase transition-colors hover:text-cream"
          >
            Scorri
            <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
