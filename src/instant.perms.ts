// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const rules = {
  items: {
    allow: { view: "isOwner", create: "isOwner", update: "isOwner", delete: "isOwner" },
    bind: { isOwner: "auth.id != null && auth.id in data.ref('user.id')" },
  },
  templates: {
    allow: { view: "isOwner", create: "isOwner", update: "isOwner", delete: "isOwner" },
    bind: { isOwner: "auth.id != null && auth.id in data.ref('user.id')" },
  },
  today: {
    allow: { view: "isOwner", create: "isOwner", update: "isOwner", delete: "isOwner" },
    bind: { isOwner: "auth.id != null && auth.id in data.ref('user.id')" },
  },
  log: {
    allow: { view: "isOwner", create: "isOwner", update: "isOwner", delete: "isOwner" },
    bind: { isOwner: "auth.id != null && auth.id in data.ref('user.id')" },
  },
} satisfies InstantRules;

export default rules;
