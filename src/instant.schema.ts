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
			type: i.string().indexed(),
			text: i.string().indexed(),
			date: i.date().indexed(),
			startTime: i.string().optional(),
			endTime: i.string().optional(),
		}),
		templates: i.entity({
			type: i.string(),
			text: i.string(),
			mode: i.string(),
			interval: i.number(),
			unit: i.string(),
			anchor: i.string().optional(),
			startTime: i.string().optional(),
			endTime: i.string().optional(),
		}),
		today: i.entity({
			order: i.number().indexed(),
		}),
		log: i.entity({
			type: i.string(),
			text: i.string(),
			date: i.date(),
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
		templateItem: {
			forward: {
				on: "templates",
				has: "one",
				label: "instance",
				required: true,
			},
			reverse: {
				on: "items",
				has: "one",
				label: "template",
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
