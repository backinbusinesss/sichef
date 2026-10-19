import { useEffect, useState } from "react";
import { Save, Building2, Gift, ShoppingBag, Sparkles, Clock3, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useContent } from "@/lib/content";
import { errorMessage } from "../useAdmin";
import { Spinner, Toast, useToast } from "../ui";
import type {
  HeroSettings,
  LoyaltySettings,
  OrderSettings,
  ReservationSettings,
  SeoSettings,
  VenueSettings,
} from "@/lib/types";

type Settings = {
  venue: VenueSettings;
  hero: HeroSettings;
  reservation: ReservationSettings;
  loyalty: LoyaltySettings;
  order: OrderSettings;
  seo: SeoSettings;
};

export function SettingsManager() {
  const { content, refresh } = useContent();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast, notify, clear } = useToast();

  useEffect(() => {
    api
      .get<{ settings: Partial<Settings> }>("/api/admin/content?resource=settings")
      .then((data) => {
        const incoming = data.settings ?? {};
        setSettings({
          venue: incoming.venue ?? ({} as VenueSettings),
          hero: incoming.hero ?? ({} as HeroSettings),
          reservation: incoming.reservation ?? ({} as ReservationSettings),
          loyalty:
            incoming.loyalty ??
            ({ pointsPerEuro: 1, welcomePoints: 20, rewardThreshold: 100, rewardValue: 10, terms: "" } as LoyaltySettings),
          order:
            incoming.order ??
            ({ prepTime: 25, deliveryFee: 3, deliveryMinimum: 20, pickupNote: "", deliveryNote: "" } as OrderSettings),
          seo: incoming.seo ?? ({} as SeoSettings),
        });
      })
      .catch((err) => notify(errorMessage(err), "error"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.post("/api/admin/content?resource=settings", { settings });
      await refresh();
      notify("Impostazioni salvate");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="grid h-64 place-items-center">
        <Spinner className="size-5 text-ember" />
      </div>
    );
  }

  const updateVenue = (patch: Partial<VenueSettings>) =>
    setSettings({ ...settings, venue: { ...settings.venue, ...patch } });
  const updateHero = (patch: Partial<HeroSettings>) =>
    setSettings({ ...settings, hero: { ...settings.hero, ...patch } });
  const updateReservation = (patch: Partial<ReservationSettings>) =>
    setSettings({ ...settings, reservation: { ...settings.reservation, ...patch } });
  const updateOrder = (patch: Partial<OrderSettings>) =>
    setSettings({ ...settings, order: { ...settings.order, ...patch } });
  const updateLoyalty = (patch: Partial<LoyaltySettings>) =>
    setSettings({ ...settings, loyalty: { ...settings.loyalty, ...patch } });
  const updateSeo = (patch: Partial<SeoSettings>) =>
    setSettings({ ...settings, seo: { ...settings.seo, ...patch } });

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Configurazione</p>
          <h1 className="mt-2 font-display text-3xl">Impostazioni</h1>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-flame btn-sm">
          {saving ? <Spinner /> : <Save className="size-3.5" />}
          Salva tutto
        </button>
      </header>

      <Card icon={Building2} title="Il locale">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" value={settings.venue.name} onChange={(v) => updateVenue({ name: v })} />
          <Field label="Tagline" value={settings.venue.tagline} onChange={(v) => updateVenue({ tagline: v })} />
          <div className="sm:col-span-2">
            <Field label="Claim" value={settings.venue.claim} onChange={(v) => updateVenue({ claim: v })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Indirizzo" value={settings.venue.address} onChange={(v) => updateVenue({ address: v })} />
          </div>
          <Field label="Telefono" value={settings.venue.phone} onChange={(v) => updateVenue({ phone: v })} />
          <Field label="Secondo numero" value={settings.venue.phoneAlt} onChange={(v) => updateVenue({ phoneAlt: v })} />
          <Field label="Email" value={settings.venue.email} onChange={(v) => updateVenue({ email: v })} />
          <Field label="WhatsApp (prefisso + numero)" value={settings.venue.whatsapp} onChange={(v) => updateVenue({ whatsapp: v })} />
          <Field label="Instagram URL" value={settings.venue.instagram} onChange={(v) => updateVenue({ instagram: v })} />
          <Field label="Facebook URL" value={settings.venue.facebook} onChange={(v) => updateVenue({ facebook: v })} />
          <Field label="Google Maps URL" value={settings.venue.maps} onChange={(v) => updateVenue({ maps: v })} />
          <Field label="Coperto" value={settings.venue.coperto} onChange={(v) => updateVenue({ coperto: v })} />
          <div className="sm:col-span-2">
            <Field label="Note pagamenti" value={settings.venue.paymentNote} onChange={(v) => updateVenue({ paymentNote: v })} />
          </div>
        </div>
      </Card>

      <Card icon={Sparkles} title="Hero (prima schermata)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kicker" value={settings.hero.kicker} onChange={(v) => updateHero({ kicker: v })} />
          <Field label="Immagine (URL)" value={settings.hero.image} onChange={(v) => updateHero({ image: v })} />
          <div className="sm:col-span-2">
            <Field label="Titolo" value={settings.hero.title} onChange={(v) => updateHero({ title: v })} />
          </div>
          <div className="sm:col-span-2">
            <Area label="Sottotitolo" value={settings.hero.subtitle} onChange={(v) => updateHero({ subtitle: v })} />
          </div>
          <Field label="CTA primaria" value={settings.hero.primaryCta} onChange={(v) => updateHero({ primaryCta: v })} />
          <Field label="CTA secondaria" value={settings.hero.secondaryCta} onChange={(v) => updateHero({ secondaryCta: v })} />
          <div className="sm:col-span-2">
            <Field
              label="Marquee (separato da virgole)"
              value={(settings.hero.marquee ?? []).join(", ")}
              onChange={(v) => updateHero({ marquee: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
        </div>
      </Card>

      <Card icon={Clock3} title="Prenotazioni">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Intervallo slot (min)"
            value={String(settings.reservation.slotMinutes)}
            onChange={(v) => updateReservation({ slotMinutes: Number(v) || 30 })}
          />
          <Field
            label="Ultimo ingresso"
            value={settings.reservation.lastSeating}
            onChange={(v) => updateReservation({ lastSeating: v })}
          />
          <Field
            label="Max persone online"
            value={String(settings.reservation.maxParty)}
            onChange={(v) => updateReservation({ maxParty: Number(v) || 10 })}
          />
          <div className="sm:col-span-3">
            <Area
              label="Avviso gruppi"
              value={settings.reservation.notice}
              onChange={(v) => updateReservation({ notice: v })}
            />
          </div>
        </div>
      </Card>

      <Card icon={ShoppingBag} title="Ordini (asporto & domicilio)">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Tempo di preparazione (min)"
            value={String(settings.order.prepTime)}
            onChange={(v) => updateOrder({ prepTime: Number(v) || 25 })}
          />
          <Field
            label="Costo consegna (€)"
            value={String(settings.order.deliveryFee)}
            onChange={(v) => updateOrder({ deliveryFee: Number(v) || 0 })}
          />
          <Field
            label="Minimo consegna (€)"
            value={String(settings.order.deliveryMinimum)}
            onChange={(v) => updateOrder({ deliveryMinimum: Number(v) || 0 })}
          />
          <div className="sm:col-span-3">
            <Area label="Nota ritiro" value={settings.order.pickupNote} onChange={(v) => updateOrder({ pickupNote: v })} />
          </div>
          <div className="sm:col-span-3">
            <Area label="Nota consegna" value={settings.order.deliveryNote} onChange={(v) => updateOrder({ deliveryNote: v })} />
          </div>
        </div>
      </Card>

      <Card icon={Gift} title="Programma fedeltà">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Punti per euro"
            value={String(settings.loyalty.pointsPerEuro)}
            onChange={(v) => updateLoyalty({ pointsPerEuro: Number(v) || 1 })}
          />
          <Field
            label="Punti di benvenuto"
            value={String(settings.loyalty.welcomePoints)}
            onChange={(v) => updateLoyalty({ welcomePoints: Number(v) || 0 })}
          />
          <Field
            label="Punti per premio"
            value={String(settings.loyalty.rewardThreshold)}
            onChange={(v) => updateLoyalty({ rewardThreshold: Number(v) || 100 })}
          />
          <Field
            label="Valore premio (€)"
            value={String(settings.loyalty.rewardValue)}
            onChange={(v) => updateLoyalty({ rewardValue: Number(v) || 10 })}
          />
          <div className="sm:col-span-2">
            <Field label="Condizioni" value={settings.loyalty.terms} onChange={(v) => updateLoyalty({ terms: v })} />
          </div>
        </div>
      </Card>

      <Card icon={Search} title="SEO">
        <div className="grid gap-3">
          <Field label="Titolo pagina" value={settings.seo.title} onChange={(v) => updateSeo({ title: v })} />
          <Area label="Meta description" value={settings.seo.description} onChange={(v) => updateSeo({ description: v })} />
        </div>
      </Card>

      {content?.closedDates && content.closedDates.length > 0 && (
        <Card icon={Clock3} title="Chiusure programmate">
          <ul className="space-y-1.5 text-[0.8rem] text-dim">
            {content.closedDates.map((entry) => (
              <li key={entry.date}>
                {entry.date} — {entry.reason || "Chiuso"}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] uppercase">
        <Icon className="size-3.5 text-ember" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input className="admin-field" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <textarea
        rows={3}
        className="admin-field resize-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
