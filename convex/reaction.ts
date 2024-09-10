import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const getMember = async (
  ctx: QueryCtx,
  params: { workspaceId: Id<"workspaces">; userId: Id<"users"> }
) => {
  const member = await ctx.db
    .query("members")
    .withIndex("workspaceId_userId", (q) =>
      q.eq("workspaceId", params.workspaceId).eq("userId", params.userId)
    )
    .unique();

  return member;
};

export const toggleReactions = mutation({
  args: {
    id: v.id("messages"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, {
      workspaceId: message.workspaceId,
      userId,
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const existingReactionFromUser = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.id),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), args.value)
        )
      )
      .first();

    if (existingReactionFromUser) {
      await ctx.db.delete(existingReactionFromUser._id);
      return existingReactionFromUser._id;
    } else {
      const newReactionId = await ctx.db.insert("reactions", {
        messageId: args.id,
        memberId: member._id,
        value: args.value,
        workspaceId: message.workspaceId,
      });
      return newReactionId;
    }
  },
});
