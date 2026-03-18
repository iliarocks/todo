import { id } from "@instantdb/solidjs";
import { Temporal } from "temporal-polyfill";
import { db } from "./db";
import { Item, Mode, Unit, Type, Todo, Template, Event } from "./types";
import { nextDate } from "./repeat";
import { between } from "./order";
import { now, today } from "./dates";

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

export const createItem = (params: CreateParameters, user: { id: string }, lastOrder?: string) => {
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
				order: between(lastOrder, undefined),
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

export const updateItem = (itemId: string, params: CreateParameters, templateId?: string, order?: string) => {
	const { text, date, start, end, notes } = params;
	const update: Record<string, any> = {
		text,
		date: date.toString(),
		start: start?.toString(),
		end: end?.toString(),
		notes,
	};
	if (order !== undefined) update.order = order;
	const transactions: any[] = [db.tx.items[itemId].update(update)];

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

export const updateTemplate = (templateId: string, instanceId: string, params: CreateParameters, order?: string) => {
	const { text, date, start, end, notes, mode, unit, interval, anchor } = params;
	const instanceUpdate: Record<string, any> = {
		text,
		date: date.toString(),
		start: start?.toString(),
		end: end?.toString(),
		notes,
	};
	if (order !== undefined) instanceUpdate.order = order;
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
		db.tx.items[instanceId].update(instanceUpdate),
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
				order: item.order,
			})
			.link({ user: user.id }),
		db.tx.templates[template.id].link({ instance: newItemId }),
		db.tx.items[item.id].delete(),
	]);
};

export const deleteTemplate = (templateId: string) => {
	db.transact([db.tx.templates[templateId].delete()]);
};

export const reorderItem = (itemId: string, before: string | undefined, after: string | undefined) => {
	db.transact([db.tx.items[itemId].update({ order: between(before, after) })]);
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
				order: todo.order,
			})
			.link({ user: user.id }),
		db.tx.templates[template.id].link({ instance: newItemId }),
		db.tx.items[todo.id].delete(),
	]);
};

export const reconcileEvents = (events: (Event & { template?: Template })[], user: { id: string }) => {
	if (events.length === 0) return;

	const expired = events.filter((e) => {
		return (
			Temporal.PlainDate.compare(e.date, today()) < 0 ||
			Temporal.PlainTime.compare(e.end ?? now(), now()) < 0
		);
	});

	if (expired.length === 0) return;

	const transactions: any[] = [];

	for (const e of expired) {
		if (e.template) {
			const date = nextDate(e.date, e.template);
			const newItemId = id();
			transactions.push(
				db.tx.items[newItemId]
					.create({
						type: "event",
						text: e.template.text,
						date: date.toString(),
						start: e.template.type === "event" ? e.template.start?.toString() : undefined,
						end: e.template.type === "event" ? e.template.end?.toString() : undefined,
						notes: e.template.notes,
						order: e.order,
					})
					.link({ user: user.id }),
				db.tx.templates[e.template.id].link({ instance: newItemId }),
			);
		}
		transactions.push(db.tx.items[e.id].delete());
	}

	db.transact(transactions);
};
