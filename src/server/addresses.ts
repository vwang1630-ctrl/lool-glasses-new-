// Auto-persist the shipping address from a placed order into the customer's
// addresses book. Called from POST /api/orders when the cookie session matches
// the order's email — guest checkouts (no session) skip this and only write
// to the order row.
//
// Semantics:
//   - Dedupe by the case-insensitive composite (recipient, country, zip,
//     address). A repeat order to the same place just bumps updated_at on the
//     existing row, never adds a new one.
//   - If the address is genuinely new and the user is below the cap, insert
//     it as a non-default row (the existing default stays default).
//   - If the user is at the cap, evict the oldest non-default row to make
//     room. The default is preserved.
//   - First-ever address for an email becomes the default automatically.
//
// Not exported as an HTTP handler — this is the server-side merge that
// happens during checkout. The user-facing CRUD lives in
// /api/account/addresses (POST / PATCH / DELETE).

import { nanoid } from "@/server/ids";
import { ADDRESS_CAP_PER_USER } from "@/routes/api/account/addresses/index";

interface ShippingFields {
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
}

type AddressIdRow = { id: string; is_default: number };

export async function upsertAddressFromOrder(
  db: D1Database,
  email: string,
  s: ShippingFields,
): Promise<void> {
  const now = Date.now();

  // 1. Exact-dedupe hit? Just touch updated_at and bail.
  const existing = await db
    .prepare(
      `SELECT id FROM addresses
       WHERE email = ?
         AND lower(recipient) = lower(?)
         AND lower(country)   = lower(?)
         AND lower(zip)       = lower(?)
         AND lower(address)   = lower(?)
       LIMIT 1`,
    )
    .bind(email, s.recipient, s.country, s.zip, s.address)
    .first<{ id: string }>();
  if (existing) {
    await db
      .prepare(`UPDATE addresses SET phone = ?, updated_at = ? WHERE id = ?`)
      .bind(s.phone, now, existing.id)
      .run();
    return;
  }

  // 2. Need to insert. Check cap; if at cap, evict the oldest non-default.
  const countRow = await db
    .prepare("SELECT COUNT(*) AS n FROM addresses WHERE email = ?")
    .bind(email)
    .first<{ n: number }>();
  const count = countRow?.n ?? 0;

  const ops = [] as ReturnType<D1Database["prepare"]>[];

  if (count >= ADDRESS_CAP_PER_USER) {
    const victim = await db
      .prepare(
        `SELECT id, is_default FROM addresses
         WHERE email = ? AND is_default = 0
         ORDER BY updated_at ASC, id ASC
         LIMIT 1`,
      )
      .bind(email)
      .first<AddressIdRow>();
    if (!victim) {
      // Edge case: the cap is full and every row is somehow default (would
      // require the partial unique index to have been bypassed). Leave the
      // book untouched rather than risk wiping a real default; the order
      // still went through with its own ship_* snapshot.
      return;
    }
    ops.push(db.prepare("DELETE FROM addresses WHERE id = ?").bind(victim.id));
  }

  const id = nanoid();
  const makeDefault = count === 0 ? 1 : 0;
  ops.push(
    db
      .prepare(
        `INSERT INTO addresses
           (id, email, recipient, country, zip, address, phone, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        email,
        s.recipient,
        s.country,
        s.zip,
        s.address,
        s.phone,
        makeDefault,
        now,
        now,
      ),
  );

  if (ops.length === 1) {
    await ops[0].run();
  } else {
    await db.batch(ops);
  }
}
