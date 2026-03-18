import { id } from "@instantdb/solidjs";
import { Temporal } from "temporal-polyfill";
import { db } from "./db";
import { Item, Mode, Unit, Type, Todo, Template } from "./types";
import { nextDate } from "./repeat";

export type CreateParameters = {
	type: Type;
	text: string;
	date: Temporal.PlainDate;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	notes?: string;
	mode?: Mode;
	interval?: number;
	unit?: Unit;
	anchor?: number[];
};

export const createItem = (params: CreateParameters, user: { id: string }) => {
	const { type, text, date, start, end, notes, mode, unit, interval, anchor } = params;
	const itemId = id();

	const transactions: any[] = [
		db.tx.items[itemId]
			.create({
				type,
				text,
				date: date.toString(),
				start: start?.toString(),
				end: end?.toString(),
				notes,
			})
			.link({ user: user.id }),
	];

	if (mode && unit && interval) {
		transactions.push(
			db.tx.templates[id()]
				.create({
					type,
					text,
					start: start?.toString(),
					end: end?.toString(),
					notes,
					mode,
					unit,
					interval,
					anchor,
					reference: mode === "absolute" ? date.toString() : undefined,
				})
				.link({ user: user.id, instance: itemId }),
		);
	}

	db.transact(transactions);
};

export const updateItem = (itemId: string, params: CreateParameters, templateId?: string) => {
	const { text, date, start, end, notes } = params;
	const transactions: any[] = [
		db.tx.items[itemId].update({
			text,
			date: date.toString(),
			start: start?.toString(),
			end: end?.toString(),
			notes,
		}),
	];

	if (templateId) {
		transactions.push(
			db.tx.templates[templateId].update({
				text,
				start: start?.toString(),
				end: end?.toString(),
				notes,
			}),
		);
	}

	db.transact(transactions);
};

export const updateTemplate = (templateId: string, instanceId: string, params: CreateParameters) => {
	const { text, date, start, end, notes, mode, unit, interval, anchor } = params;
	db.transact([
		db.tx.templates[templateId].update({
			text,
			start: start?.toString(),
			end: end?.toString(),
			notes,
			mode,
			unit,
			interval,
			anchor,
			reference: mode === "absolute" ? date.toString() : undefined,
		}),
		db.tx.items[instanceId].update({
			text,
			date: date.toString(),
			start: start?.toString(),
			end: end?.toString(),
			notes,
		}),
	]);
};

export const deleteItem = (item: Item & { template?: Template }, user: { id: string }) => {
	if (item.template === undefined) {
		db.transact([db.tx.items[item.id].delete()]);
		return;
	}

	const { template } = item;
	const date = nextDate(item.date, template);
	const newItemId = id();

	const start = template.type === "event" ? template.start?.toString() : undefined;
	const end = template.type === "event" ? template.end?.toString() : undefined;

	db.transact([
		db.tx.items[newItemId]
			.create({
				type: item.type,
				text: template.text,
				date: date.toString(),
				start,
				end,
				notes: template.notes,
			})
			.link({ user: user.id }),
		db.tx.templates[template.id].link({ instance: newItemId }),
		db.tx.items[item.id].delete(),
	]);
};

export const deleteTemplate = (templateId: string) => {
	db.transact([db.tx.templates[templateId].delete()]);
};

export const reconcileEvents = (items: Item[]) => {
	const stale = items.filter((i) => i.type === "event");
	if (stale.length === 0) return;
	db.transact(stale.map((i) => db.tx.items[i.id].delete()));
};

export const reorderItems = (ids: string[]) => {
	db.transact(
		ids.map((itemId, i) =>
			db.tx.items[itemId].update({ order: String(i).padStart(5, "0") }),
		),
	);
};

export const completeTodo = (todo: Todo & { template?: Template }, user: { id: string }) => {
	if (!todo.template) {
		db.transact([db.tx.items[todo.id].delete()]);
		return;
	}

	const { template } = todo;
	const date = nextDate(todo.date, template);
	const newItemId = id();

	db.transact([
		db.tx.items[newItemId]
			.create({
				type: "todo",
				text: template.text,
				date: date.toString(),
				notes: template.notes,
			})
			.link({ user: user.id }),
		db.tx.templates[template.id].link({ instance: newItemId }),
		db.tx.items[todo.id].delete(),
	]);
};
