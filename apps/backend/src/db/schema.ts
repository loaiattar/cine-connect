import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    externalMovieId: integer("external_movie_id").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    externalMovieId: integer("external_movie_id").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
    pk: unique().on(t.userId, t.externalMovieId),
}));

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    externalMovieId: integer("external_movie_id").notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const watchlists = pgTable("watchlists", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    externalMovieId: integer("external_movie_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
    followerId: integer("follower_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    followingId: integer("following_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    pk: unique().on(t.followerId, t.followingId),
}));

export const profiles = pgTable("profiles", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    location: text("location"),
    favoriteGenre: text("favorite_genre"),
});