import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { useContent } from "@/lib/content";

export function PrivacyPage() {
  const { content } = useContent();
  const venue = content?.settings.venue;

  return (
    <>
      <PageHero
        eyebrow="Informativa"
        title="Privacy &"
        italic="cookie."
        description="Come trattiamo i dati personali raccolti attraverso il sito, le prenotazioni, gli ordini e il programma fedeltà."
        image="/assets/img/table.webp"
        crumb="Privacy"
      />
      <section className="bg-cream py-14 md:py-20">
        <div className="shell-tight">
          <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink/35 uppercase">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>
          <div className="mt-8 space-y-8 text-[0.88rem] leading-relaxed text-ink/60">
            <section>
              <h2 className="text-2xl text-ink">Titolare del trattamento</h2>
              <p className="mt-2">
                {venue?.name ?? "Ristorante Sì Chef"} — {venue?.address ?? "Via S. Clemente 151, 20023 Cerro Maggiore (MI)"}.
                Contatti: {venue?.email ?? "ristorantesichef@gmail.com"} · {venue?.phone ?? "0331 519111"}.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Dati raccolti</h2>
              <p className="mt-2">
                Raccogliamo i dati che ci fornisci volontariamente tramite il modulo di
                prenotazione (nome, telefono, email, numero di persone, data, orario, zona, note su
                allergie o richieste), il modulo di contatto, il modulo ordini (dati di consegna e
                dettagli dell'ordine), l'iscrizione alla newsletter e al programma fedeltà (nome,
                email, telefono, data di nascita facoltativa, codice tessera e movimenti punti).
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Finalità e base giuridica</h2>
              <p className="mt-2">
                I dati di prenotazione e ordine sono trattati per gestire la richiesta, preparare e
                consegnare il servizio (esecuzione di un contratto o misure precontrattuali). I dati
                relativi ad allergie e intolleranze sono trattati esclusivamente per garantire la
                sicurezza alimentare e sono comunicati alla cucina. Newsletter e programma fedeltà
                si basano sul tuo consenso, revocabile in qualsiasi momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Conservazione</h2>
              <p className="mt-2">
                Prenotazioni e ordini sono conservati per il tempo necessario alla gestione del
                servizio e agli obblighi amministrativi e fiscali. I dati newsletter sono conservati
                fino alla disiscrizione. I dati del programma fedeltà sono conservati fino alla
                chiusura del rapporto o alla richiesta di cancellazione.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Cookie</h2>
              <p className="mt-2">
                Il sito utilizza cookie tecnici necessari al funzionamento e alla sicurezza
                dell'area riservata. Il carrello degli ordini viene salvato nel local storage del
                browser per ricordare la selezione. Non utilizziamo cookie pubblicitari di
                profilazione. Mappe e font esterni possono comportare connessioni a servizi di terze
                parti (Google Maps, Google Fonts).
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Comunicazione dei dati</h2>
              <p className="mt-2">
                I dati possono essere trattati da fornitori tecnici (hosting, database, servizi
                email) nominati responsabili del trattamento. Non vendiamo né cediamo i dati a terzi
                per finalità di marketing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">I tuoi diritti</h2>
              <p className="mt-2">
                Puoi chiedere accesso, rettifica, cancellazione, limitazione o portabilità dei dati,
                oppure opporti al trattamento, scrivendo a {venue?.email ?? "ristorantesichef@gmail.com"}.
                Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati
                personali.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-ink">Allergeni</h2>
              <p className="mt-2">
                Le informazioni sugli allergeni sono fornite secondo il Regolamento UE 1169/2011.
                Le preparazioni avvengono in una cucina condivisa: non possiamo escludere
                contaminazioni crociate. Segnala sempre allergie e intolleranze al personale prima
                dell'ordinazione.
              </p>
            </section>
          </div>

          <Link to="/" className="btn btn-ghost btn-sm mt-10">
            <ArrowLeft className="size-3.5" /> Torna alla home
          </Link>
        </div>
      </section>
    </>
  );
}
