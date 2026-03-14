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
			type: i.string().optional(),
		}),
		items: i.entity({
			type: i.string().indexed(),
			text: i.string().indexed(),
			date: i.string().indexed(),
			start: i.string().optional(),
			end: i.string().optional(),
		}),
		templates: i.entity({
			type: i.string(),
			text: i.string(),
			mode: i.string(),
			interval: i.number(),
			unit: i.string(),
			anchor: i.string(),
			start: i.string().optional(),
			end: i.string().optional(),
		}),
		today: i.entity({
			order: i.number().indexed(),
		}),
	},
	links: {
		userItems: {
			forward: { on: "items", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "items" },
		},
		userTemplates: {
			forward: { on: "templates", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "templates" },
		},
		userToday: {
			forward: { on: "today", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "today" },
		},
		todayItem: {
			forward: { on: "today", has: "one", label: "item", onDelete: "cascade" },
			reverse: { on: "items", has: "one", label: "today" },
		},
		templateInstance: {
			forward: { on: "templates", has: "one", label: "instance" },
			reverse: { on: "items", has: "one", label: "template" },
		},
	},
	rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
