import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Ensures shipped migrations keep an index suitable for room-scoped history (room_id filter + sort). */
describe("messages room history index (migration)", () => {
  it("0000 migration defines btree index on messages with room_id leading", () => {
    const sqlPath = path.join(__dirname, "../../drizzle/0000_glorious_maverick.sql");
    const sql = readFileSync(sqlPath, "utf8");
    expect(sql).toMatch(/CREATE INDEX "messages_room_id_created_at_idx"/);
    expect(sql).toMatch(/"room_id"/);
    expect(sql).toMatch(/"created_at"/);
  });
});
