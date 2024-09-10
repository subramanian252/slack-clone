import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversations = mutation({
  args: { memberId: v.id("members"), workspaceId: v.id("workspaces") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", params.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) return null;

    const otherMember = await ctx.db.get(params.memberId);

    if (!otherMember) return null;

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), params.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id)
          )
        )
      )
      .unique();

    if (existingConversation) {
      return existingConversation;
    }

    const conversationId = await ctx.db.insert("conversations", {
      workspaceId: params.workspaceId,
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
    });

    const conversation = await ctx.db.get(conversationId);

    return conversation;
  },
});
