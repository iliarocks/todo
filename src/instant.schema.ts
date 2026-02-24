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
    todos: i.entity({
      done: i.boolean(),
      text: i.string(),
    }),
		events: i.entity({
			text: i.string(),
			date: i.date(),
		}),
		today: i.entity({
			order: i.number().indexed(),
			type: i.string(),
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
		todayTodo: {
			forward: {
				on: "today",
				has: "one",
				label: "todo",
			},
			reverse: {
				on: "todos",
				has: "one",
				label: "today",
			},
		},
		todayEvent: {
			forward: {
				on: "today",
				has: "one",
				label: "event",
			},
			reverse: {
				on: "events",
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
