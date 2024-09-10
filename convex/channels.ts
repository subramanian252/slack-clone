import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { remove } from "./workspaces";

export const create = mutation({
  args: {
    name: v.string(),
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

    if (!member || member.role !== "admin") throw new Error("Unauthorized");

    const name = params.name.replace(/\s+/g, "-");

    const channelId = await ctx.db.insert("channels", {
      name: name,
      workspaceId: params.id,
    });

    return channelId;
  },
});

export const getChannels = query({
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

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", params.id))
      .collect();

    return channels;
  },
});

export const getChannelById = query({
  args: { id: v.id("channels") },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(params.id);

    if (!channel) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", channel?.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    return channel;
  },
});

export const updateChannel = mutation({
  args: {
    id: v.id("channels"),
    name: v.string(),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const channel = await ctx.db.get(params.id);

    if (!channel) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", channel?.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") return null;

    const name = params.name.replace(/\s+/g, "-");

    await ctx.db.patch(channel._id, {
      name: name,
    });

    return channel._id;
  },
});

export const removeChannel = mutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, params) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const channel = await ctx.db.get(params.id);

    if (!channel) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("workspaceId_userId", (q) =>
        q.eq("workspaceId", channel?.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role !== "admin") return null;

    const [messages] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(channel._id);

    return channel._id;
  },
});
