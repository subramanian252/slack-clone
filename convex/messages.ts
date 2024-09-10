import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

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

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
    .collect();
};

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parenMessageId", (q) => q.eq("parenMessageId", messageId))
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lasteMessageMember = await populateMember(ctx, lastMessage.memeberId);

  if (!lasteMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lasteMessageMemberUser = await populateUser(
    ctx,
    lasteMessageMember.userId
  );

  return {
    count: messages.length,
    image: lasteMessageMemberUser?.image,
    timestamp: lastMessage._creationTime,
    name: lasteMessageMemberUser?.name,
  };
};

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Not authenticated");
    }
    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      _conversationId = parentMessage.conversationId;
    }
    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_converstation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parenMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memeberId);
            const user = member
              ? await populateUser(ctx, member?.userId)
              : null;

            if (!member || !user) {
              return null;
            }

            const reactions = await populateReactions(ctx, message._id);

            const thread = await populateThread(ctx, message._id);

            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWithCounts = reactions.map((reaction) => ({
              ...reaction,
              count: reactions.filter((r) => r.value === reaction.value).length,
            }));

            const dededupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            const reactionsWithoutMemberIds = dededupedReactions.map(
              ({ memberIds, ...reaction }) => reaction
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: dededupedReactions,
              threadCount: thread.count,
              threadImage: thread.image,
              threadTimestamp: thread.timestamp,
              threadName: thread.name,
            };
          })
        )
      ).filter((m) => m !== null),
    };
  },
});

export const getmessageById = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.id);
    if (!message) {
      return null;
    }

    const member = getMember(ctx, {
      workspaceId: message.workspaceId,
      userId,
    });

    if (!member) {
      return null;
    }

    const popMember = await populateMember(ctx, message.memeberId);

    if (!popMember) {
      return null;
    }

    const popUser = await populateUser(ctx, popMember?.userId);

    if (!popUser) {
      return null;
    }

    const reactions = await populateReactions(ctx, message._id);

    const reactionsWithCounts = reactions.map((reaction) => ({
      ...reaction,
      count: reactions.filter((r) => r.value === reaction.value).length,
    }));

    const dededupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );
    return {
      ...message,
      image: message.image ? await ctx.storage.getUrl(message.image) : null,
      popMember,
      popUser,
      reactions: dededupedReactions,
    };
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    body: v.string(),
    image: v.optional(v.id("_storage")),
    channelId: v.optional(v.id("channels")),
    parenMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const getMemberQuery = await getMember(ctx, {
      workspaceId: args.workspaceId,
      userId,
    });
    if (!getMemberQuery) {
      return null;
    }

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parenMessageId) {
      const parentMessage = await ctx.db.get(args.parenMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      _conversationId = parentMessage.conversationId;
    }

    const message = await ctx.db.insert("messages", {
      workspaceId: args.workspaceId,
      memeberId: getMemberQuery._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      parenMessageId: args.parenMessageId,
      conversationId: _conversationId,
    });
    return message;
  },
});

export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, {
      workspaceId: message.workspaceId,
      userId,
    });

    if (!member || message.memeberId !== member._id) {
      throw new Error("Unauthorized");
    }

    const messageId = await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const removeMessage = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, {
      workspaceId: message.workspaceId,
      userId,
    });

    if (!member || message.memeberId !== member._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
