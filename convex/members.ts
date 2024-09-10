import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMemberById = query({
  args: { id: v.id("members") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const member = await ctx.db.get(params.id);

    if (!member) return null;

    const user = await ctx.db.get(member.userId);

    return { ...member, user };
  },
});

export const getMember = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", params.id).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    return member;
  },
});

export const getMembers = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", params.id).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    const membersQuery = await ctx.db
      .query("members")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
      .collect();

    const members = [];

    for (const member of membersQuery) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        members.push({
          ...member,
          user,
        });
      }
    }

    return members;
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(params.id);

    if (!member) throw new Error("Member not found");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin")
      throw new Error("Unauthorized");

    await ctx.db.patch(params.id, { role: params.role });

    return params.id;
  },
});

export const removeMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(params.id);

    if (!member) throw new Error("Member not found");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("Cannot remove admin");
    }

    if (currentMember._id === params.id && currentMember.role === "admin") {
      throw new Error("Cannot remove yourself ikf you are an admin");
    }

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_memberId", (q) => q.eq("memeberId", member._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), member._id)
          )
        )
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(params.id);

    return params.id;
  },
});
