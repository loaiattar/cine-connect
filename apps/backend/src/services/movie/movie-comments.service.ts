import { db } from "../../db";
import { comments, users, follows, notifications } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AppError, badRequest, forbidden, notFound, sanitizeUserText } from "../../utils";

export const MovieCommentsService = {
  async addComment(userId: number, movieId: number, comment: string) {
    const safeComment = sanitizeUserText(comment);
    if (!safeComment) {
      throw badRequest("Comment cannot be empty");
    }

    return db.transaction(async (tx) => {
      const [newComment] = await tx
        .insert(comments)
        .values({
          userId,
          externalMovieId: movieId,
          comment: safeComment,
        })
        .returning();

      if (!newComment) {
        throw new AppError("Failed to create comment", 500);
      }

      const [commenter] = await tx
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const displayName = commenter?.name?.trim() || "Un membre";

      const followerRows = await tx
        .select({ followerId: follows.followerId })
        .from(follows)
        .where(eq(follows.followingId, userId));

      if (followerRows.length > 0) {
        const message = `${displayName} a laissé un commentaire sur un film`;
        await tx.insert(notifications).values(
          followerRows.map((f) => ({
            userId: f.followerId,
            message,
            linkType: "movie",
            targetId: movieId,
          }))
        );
      }

      const [withUser] = await tx
        .select({
          id: comments.id,
          userId: comments.userId,
          externalMovieId: comments.externalMovieId,
          comment: comments.comment,
          createdAt: comments.createdAt,
          userEmail: users.email,
          userName: users.name,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.id, newComment.id))
        .limit(1);
      return withUser ?? newComment;
    });
  },

  async getMovieComments(movieId: number) {
    return db
      .select({
        id: comments.id,
        userId: comments.userId,
        externalMovieId: comments.externalMovieId,
        comment: comments.comment,
        createdAt: comments.createdAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.externalMovieId, movieId));
  },

  async deleteComment(userId: number, commentId: number) {
    const [existing] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existing) {
      throw notFound("Comment not found");
    }

    if (existing.userId !== userId) {
      throw forbidden("You can only delete your own comments");
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    return { action: "removed" };
  },

  async updateComment(userId: number, commentId: number, comment: string) {
    const [existing] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existing) {
      throw notFound("Comment not found");
    }

    if (existing.userId !== userId) {
      throw forbidden("You can only update your own comments");
    }

    const safeComment = sanitizeUserText(comment);
    if (!safeComment) {
      throw badRequest("Comment cannot be empty");
    }

    await db
      .update(comments)
      .set({ comment: safeComment })
      .where(eq(comments.id, commentId));

    return { action: "updated" };
  },
};
