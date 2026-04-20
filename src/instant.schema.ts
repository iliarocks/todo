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
			type: i.string(),
			text: i.string(),
			date: i.string(),
			notes: i.string().optional(),
			start: i.string().optional(),
			end: i.string().optional(),
			order: i.string().indexed(),
		}),
		templates: i.entity({
			type: i.string(),
			text: i.string(),
			notes: i.string().optional(),
			start: i.string().optional(),
			end: i.string().optional(),
			mode: i.string(),
			unit: i.string(),
			interval: i.number(),
			anchor: i.json(),
			reference: i.string().optional(),
		}),
		visions: i.entity({
			text: i.string(),
		}),
		groups: i.entity({
			name: i.string(),
			notes: i.string().optional(),
			active: i.boolean(),
		}),
	},
	links: {
		itemUser: {
			forward: { on: "items", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "items" },
		},
		templateUser: {
			forward: { on: "templates", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "templates" },
		},
		templateItems: {
			forward: { on: "templates", has: "one", label: "instance", required: true },
			reverse: { on: "items", has: "one", label: "template" },
		},
		visionUser: {
			forward: { on: "visions", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "one", label: "vision" },
		},
		visionReminder: {
			forward: { on: "visions", has: "one", label: "reminder" },
			reverse: { on: "items", has: "one", label: "vision" },
		},
		groupUser: {
			forward: { on: "groups", has: "one", label: "user", onDelete: "cascade", required: true },
			reverse: { on: "$users", has: "many", label: "groups" },
		},
		itemGroup: {
			forward: { on: "items", has: "one", label: "group" },
			reverse: { on: "groups", has: "many", label: "items" },
		},
		templateGroup: {
			forward: { on: "templates", has: "one", label: "group" },
			reverse: { on: "groups", has: "many", label: "templates" },
		},
	},
	rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
