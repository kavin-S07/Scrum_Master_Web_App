import { AppError } from './AppError';

/**
 * Every `update()` repository method in the original code built its SET
 * clause like this:
 *
 *   const fields = Object.keys(data).map((k, i) => `${k} = $${i + 2}`).join(', ');
 *
 * The *value* is parameterized, but the *column name* (`k`) is taken
 * straight from the incoming object's keys and concatenated into raw SQL.
 * Several of those routes (team/project/sprint/task PUT endpoints) had no
 * Joi schema validating the request body, so a client could send a JSON
 * body with an attacker-chosen key — e.g. `{"id = uuid_generate_v4() --": 1}`
 * — and have it interpolated directly into the query string. That's SQL
 * injection via object keys, not just unvalidated input.
 *
 * This helper closes that hole with an explicit column allow-list, used by
 * every repository's update() method regardless of whether the route also
 * has Joi validation in front of it (defense in depth — validation can be
 * misconfigured or bypassed, the allow-list can't be).
 *
 * It also fixes the related bug where an empty `data` object produced
 * `SET , updated_at = NOW()` (invalid SQL) — we now throw a clear 400
 * instead of letting a malformed query reach Postgres.
 */
export function buildUpdateSet(
  data: Record<string, unknown>,
  allowedColumns: readonly string[],
  startParamIndex = 1
): { setClause: string; values: unknown[] } {
  const entries = Object.entries(data).filter(
    ([key, value]) => allowedColumns.includes(key) && value !== undefined
  );

  if (entries.length === 0) {
    throw new AppError('No valid fields provided to update', 400);
  }

  const setClause = entries
    .map(([key], i) => `${key} = $${i + startParamIndex}`)
    .join(', ');
  const values = entries.map(([, value]) => value);

  return { setClause, values };
}