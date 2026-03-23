import { pgTable, serial, text, timestamp, integer, unique, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

/** Opaque refresh tokens are hashed (SHA-256) before storage; rotation replaces the row on each refresh. */
export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: serial("id").primaryKey(),
        userId: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        tokenHash: text("token_hash").notNull().unique(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [index("refresh_tokens_user_id_idx").on(t.userId)]
);

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
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow(),
    /** Optional: "profile" | "movie" — used by frontend to link to the relevant page */
    linkType: text("link_type"),
    /** Optional: userId for profile link, or externalMovieId for movie link */
    targetId: integer("target_id"),
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

/**
 * Chat messages (real-time discussion rooms). roomId matches Socket.io rooms (e.g. "global", "film:550").
 *
 * Index: `room_id` is the leading column so equality filters on room reuse the B-tree prefix.
 * `created_at` is the second column so history queries (`WHERE room_id = ? ORDER BY created_at`)
 * can scan in sort order without a separate sort step — preferable to a room_id-only index for pagination.
 */
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id").references(() => users.id, { onDelete: "set null" }),
    roomId: text("room_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    index("messages_room_id_created_at_idx").on(t.roomId, t.createdAt),
]);