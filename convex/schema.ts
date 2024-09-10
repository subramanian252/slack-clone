import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),
  members: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("workspaceId_userId", ["workspaceId", "userId"])
    .index("by_userId", ["userId"])
    .index("by_workspaceId", ["workspaceId"]),
  channels: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
  }).index("by_workspaceId", ["workspaceId"]),
  conversations: defineTable({
    workspaceId: v.id("workspaces"),
    memberOneId: v.id("members"),
    memberTwoId: v.id("members"),
  }).index("by_workspaceId", ["workspaceId"]),
  messages: defineTable({
    workspaceId: v.id("workspaces"),
    memeberId: v.id("members"),
    body: v.string(),
    image: v.optional(v.id("_storage")),
    channelId: v.optional(v.id("channels")),
    parenMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_memberId", ["memeberId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_channelId", ["channelId"])
    .index("by_parenMessageId", ["parenMessageId"])
    .index("by_channel_id_parent_message_id_converstation_id", [
      "channelId",
      "parenMessageId",
      "conversationId",
    ]),
  reactions: defineTable({
    workspaceId: v.id("workspaces"),
    messageId: v.id("messages"),
    memberId: v.id("members"),
    value: v.string(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_memberId", ["memberId"])
    .index("by_messageId", ["messageId"]),
});

export default schema;
