// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const ownerRule = {
  allow: { view: "isOwner", create: "isOwner", update: "isOwner", delete: "isOwner" },
  bind: { isOwner: "auth.id != null && auth.id in data.ref('user.id')" },
};

const rules = {
  items:     ownerRule,
  templates: ownerRule,
} satisfies InstantRules;

export default rules;
