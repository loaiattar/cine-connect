import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    movieId: integer("movie_id").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
});