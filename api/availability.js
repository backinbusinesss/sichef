import { db } from "./_lib/db.js";
import { json, error, cors, allow, isIsoDate } from "./_lib/http.js";

const DEFAULT_CAPACITY = 90;

function minutes(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function toTime(total) {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * Slot prenotabili per una data: legge gli orari di apertura,
 * esclude i giorni di chiusura e scala i posti già prenotati.
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (allow(req, res, ["GET"])) return;

  const date = String(req.query.date || "");
  if (!isIsoDate(date)) return error(req, res, 400, "Data non valida.");

  try {
    const sql = db();
    const [closedRows, hoursRows, reservationRows, settingsRows] = await Promise.all([
      sql`select reason from closed_dates where date = ${date}::date`,
      sql`select * from opening_hours`,
      sql`
        select time, coalesce(sum(party_size), 0)::int as booked
        from reservations
        where date = ${date}::date and status in ('pending', 'confirmed')
        group by time
      `,
      sql`select value from site_settings where key = 'reservation'`,
    ]);

    if (closedRows.length) {
      return json(req, res, 200, {
        date,
        closed: true,
        reason: closedRows[0].reason || "Siamo chiusi.",
        slots: [],
      });
    }

    const settings = settingsRows[0]?.value ?? {};
    const step = Number(settings.slotMinutes) || 30;
    const lastSeating = settings.lastSeating || "22:30";
    const capacity = Number(settings.capacity) || DEFAULT_CAPACITY;

    const day = new Date(`${date}T12:00:00`).getDay();
    const row = hoursRows.find((h) => h.day_of_week === day);
    if (!row || row.is_closed) {
      return json(req, res, 200, { date, closed: true, reason: "Siamo chiusi.", slots: [] });
    }

    const booked = new Map(reservationRows.map((r) => [r.time, r.booked]));
    const slots = [];

    const windows = [
      [row.lunch_open, row.lunch_close],
      [row.dinner_open, row.dinner_close],
    ].filter(([open, close]) => open && close);

    for (const [open, close] of windows) {
      let start = minutes(open);
      let end = minutes(close);
      if (end <= start) end += 1440;
      const limit = Math.min(end, minutes(lastSeating) + 720);
      for (let t = start; t + 90 <= limit; t += step) {
        const label = toTime(t);
        const used = booked.get(label) ?? 0;
        slots.push({
          time: label,
          seatsLeft: Math.max(0, capacity - used),
          available: capacity - used >= 1,
        });
      }
    }

    return json(req, res, 200, { date, closed: false, slots });
  } catch (err) {
    console.error("availability error", err);
    return error(req, res, 500, "Impossibile verificare la disponibilità.");
  }
}
