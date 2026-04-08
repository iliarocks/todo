import { id } from "@instantdb/solidjs";
import { Temporal } from "temporal-polyfill";
import { db } from "./db";
import { Item, Mode, Unit, Type, Template, EventTemplate } from "./types";
import { nextDate } from "./repeat";
import { between } from "./order";

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

	const template = item.template;
	const date = nextDate(item.date, template);
	db.transact([
		db.tx.items[id()]
			.create({
				type: template.type,
				text: template.text,
				date: date.toString(),
				start: template.type === "event" ? (template as EventTemplate).start?.toString() : undefined,
				end: template.type === "event" ? (template as EventTemplate).end?.toString() : undefined,
				notes: template.notes,
				order: item.order,
			})
			.link({ user: user.id, template: template.id }),
		db.tx.items[item.id].delete(),
	]);
};

export const deleteTemplate = (templateId: string) => {
	db.transact([db.tx.templates[templateId].delete()]);
};
