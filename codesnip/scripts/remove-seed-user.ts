import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "../src/server/db";
import { snippetTags, tags, users } from "../src/server/db/schema";

async function main() {
  const email = "seed@codesnip.dev";

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!existing) {
    console.log(`No seed user found for email: ${email}`);
    return;
  }

  console.log(`Found seed user: ${existing.id} (${existing.email}). Deleting user and related records...`);

  await db.delete(users).where(eq(users.id, existing.id));

  console.log("Seed user deleted. Now cleaning up orphan tags...");

  const allTags = await db.select().from(tags);

  for (const t of allTags) {
    const [link] = await db.select().from(snippetTags).where(eq(snippetTags.tagId, t.id)).limit(1);
    if (!link) {
      await db.delete(tags).where(eq(tags.id, t.id));
      console.log(`Deleted orphan tag: ${t.name}`);
    }
  }

  console.log("Cleanup complete.");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
