// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/solidjs";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
		items: i.entity({
			type: i.string(),
			text: i.string(),
			date: i.date().indexed(),
		}),
		today: i.entity({
			order: i.number().indexed(),
		}),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
		todayItem: {
			forward: {
				on: "today",
				has: "one",
				label: "item",
			},
			reverse: {
				on: "items",
				has: "one",
				label: "today",
			},
		},
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
