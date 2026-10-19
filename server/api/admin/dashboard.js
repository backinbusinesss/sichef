import { db } from "../_lib/db.js";
import { json, error, cors, allow } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

/** Dashboard: numeri chiave, prenotazioni, ordini e messaggi. */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;
  if (allow(req, res, ["GET"])) return;

  try {
    const sql = db();
    const [
      today,
      upcoming,
      reservationStats,
      orderStats,
      messageStats,
      loyaltyStats,
      recentOrders,
      recentMessages,
      topItems,
    ] = await Promise.all([
      sql`
        select id, name, phone, party_size, date::text as date, time, area, status, notes, occasion
        from reservations
        where date = current_date and status in ('pending', 'confirmed')
        order by time asc
      `,
      sql`
        select id, name, phone, party_size, date::text as date, time, area, status
        from reservations
        where date > current_date and status in ('pending', 'confirmed')
        order by date asc, time asc limit 8
      `,
      sql`
        select
          count(*) filter (where date = current_date)::int as today_count,
          coalesce(sum(party_size) filter (where date = current_date and status in ('pending','confirmed')), 0)::int as today_guests,
          count(*) filter (where status = 'pending' and date >= current_date)::int as pending,
          count(*) filter (where date >= date_trunc('month', current_date))::int as month_count
        from reservations
      `,
      sql`
        select
          count(*) filter (where created_at >= current_date)::int as today_count,
          count(*) filter (where status in ('pending','confirmed','preparing','ready','delivering'))::int as active_count,
          coalesce(sum(total) filter (where created_at >= current_date and status <> 'cancelled'), 0)::numeric as today_revenue,
          count(*)::int as total_count
        from orders
      `,
      sql`
        select count(*) filter (where status = 'new')::int as new_count, count(*)::int as total_count
        from contact_messages
      `,
      sql`
        select count(*)::int as members, coalesce(sum(points), 0)::int as points from loyalty_members where is_active = true
      `,
      sql`
        select id, code, name, phone, fulfilment, pickup_time, total, status, created_at
        from orders order by created_at desc limit 6
      `,
      sql`
        select id, name, subject, created_at from contact_messages order by created_at desc limit 5
      `,
      sql`
        select oi.name, count(*)::int as count, coalesce(sum(oi.quantity), 0)::int as quantity
        from order_items oi
        group by oi.name order by quantity desc limit 6
      `,
    ]);

    const newsletterRow = await sql`select count(*)::int as count from newsletter_subscribers`;

    return json(req, res, 200, {
      today: today.map((r) => ({
        id: r.id, name: r.name, phone: r.phone, partySize: r.party_size,
        time: r.time, area: r.area, status: r.status, notes: r.notes, occasion: r.occasion,
      })),
      upcoming: upcoming.map((r) => ({
        id: r.id, name: r.name, phone: r.phone, partySize: r.party_size,
        date: r.date, time: r.time, area: r.area, status: r.status,
      })),
      recentOrders: recentOrders.map((r) => ({
        id: r.id, code: r.code, name: r.name, phone: r.phone, fulfilment: r.fulfilment,
        pickupTime: r.pickup_time, total: Number(r.total), status: r.status, createdAt: r.created_at,
      })),
      recentMessages: recentMessages.map((r) => ({
        id: r.id, name: r.name, subject: r.subject, createdAt: r.created_at,
      })),
      stats: {
        ...reservationStats[0],
        newsletter: newsletterRow[0].count,
        ordersToday: orderStats[0].today_count,
        ordersActive: orderStats[0].active_count,
        revenueToday: Number(orderStats[0].today_revenue),
        ordersTotal: orderStats[0].total_count,
        messagesNew: messageStats[0].new_count,
        messagesTotal: messageStats[0].total_count,
        loyaltyMembers: loyaltyStats[0].members,
        loyaltyPoints: loyaltyStats[0].points,
      },
      topItems: topItems.map((r) => ({ name: r.name, count: r.count, quantity: r.quantity })),
    });
  } catch (err) {
    console.error("dashboard error", err);
    return error(req, res, 500, "Impossibile caricare la dashboard.");
  }
}
