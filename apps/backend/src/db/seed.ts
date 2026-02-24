import path from "node:path";
import dotenv from "dotenv";

// Load .env from backend package root so seed works whether run from backend dir or monorepo root.
// When run via ts-node: __dirname is src/db; when run via node dist/db/seed.js: __dirname is dist/db.
const backendRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

import { db } from "./index";
import { users, comments, favorites } from "./schema";

async function main() {
    console.log("Seeding database...");

    await db.delete(comments);
    await db.delete(favorites);
    await db.delete(users);

    const [user1, user2] = await db.insert(users).values([
        {
            name: "Loai Dev",
            email: "[EMAIL_ADDRESS]",
            password: "password123",
        },
        {
            name: "Piere Code",
            email: "[EMAIL_ADDRESS]",
            password: "password123",
        },
    ]).returning();

    console.log("Users created");

    await db.insert(comments).values([
        {
            userId: user1.id,
            externalMovieId: 550,
            comment: "This movie is a masterpiece! Must watch.",
        },
        {
            userId: user2.id,
            externalMovieId: 550,
            comment: "The first rule of Fight Club is...",
        },
        {
            userId: user1.id,
            externalMovieId: 27205, // Inception
            comment: "My brain hurts, but I love it.",
        },
    ]);

    console.log("Comments created");

    await db.insert(favorites).values([
        { userId: user1.id, externalMovieId: 550 },
        { userId: user2.id, externalMovieId: 27205 },
    ]);

    console.log("Favorites created");
    console.log("Seeding completed successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});