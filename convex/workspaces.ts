import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const joinCode = Array.from(
      { length: 6 },
      () =>
        "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");

    const workspaceId = await ctx.db.insert("workspaces", {
      name: params.name,
      userId: userId,
      joinCode: joinCode,
    });

    await ctx.db.insert("members", {
      workspaceId: workspaceId,
      userId: userId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      workspaceId: workspaceId,
      name: "general",
    });

    return workspaceId;
  },
});

export const updateJoinCode = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", params.id).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const joinCode = Array.from(
      { length: 6 },
      () =>
        "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");

    await ctx.db.patch(params.id, {
      joinCode: joinCode,
    });

    return params.id;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const workspaceIds = members.map((m) => m.workspaceId);

    const workspaces: Doc<"workspaces">[] = [];

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) {
        workspaces.push(workspace);
      }
    }

    return workspaces;
  },
});

export const getInfobyId = query({
  args: {
    id: v.id("workspaces"),
  },
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

    const workspace = await ctx.db.get(params.id);
    return { isMember: !!member, name: workspace?.name };
  },
});

export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
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

    const workspace = await ctx.db.get(params.id);

    return workspace;
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
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

    if (!member || member.role !== "admin") return null;

    await ctx.db.patch(params.id, {
      name: params.name,
    });

    return params.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
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

    if (!member || member.role !== "admin") return null;

    const [members, channels, messages, conversations, reactions] =
      await Promise.all([
        ctx.db
          .query("members")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
          .collect(),
        ctx.db
          .query("channels")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
          .collect(),
        ctx.db
          .query("messages")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
          .collect(),
        ctx.db
          .query("conversations")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
          .collect(),
        ctx.db
          .query("reactions")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
          .collect(),
      ]);

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(params.id);

    return params.id;
  },
});

export const joinWorkSpace = mutation({
  args: {
    id: v.id("workspaces"),
    joinCode: v.string(),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const workSpace = await ctx.db.get(params.id);
    if (!workSpace) throw new Error("Workspace not found");

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", params.id).eq("userId", userId)
      )
      .unique();

    if (member) {
      throw new Error("Already a member");
    }

    if (workSpace.joinCode !== params.joinCode) {
      throw new Error("Invalid join code");
    }

    await ctx.db.insert("members", {
      workspaceId: params.id,
      userId: userId,
      role: "member",
    });

    return params.id;
  },
});
