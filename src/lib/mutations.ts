import { id } from "@instantdb/solidjs";
import { db } from "./db";
import { Item, Template } from "./types";
import { nextDate } from "./repeat";
import { Mode, Unit } from "./form";
import { Temporal } from "temporal-polyfill";

export const createTodo = (
	text: string,
	notes: string,
	date: Temporal.PlainDate,
	mode: Mode,
	interval: number,
	unit: Unit,
	anchor: string,
	user: { id: string },
) => {
	const type = "todo";
	const itemId = id();

	const transactions: any[] = [
		db.tx.items[itemId].create({ type, text, notes: notes || undefined, date: date.toString() }).link({ user: user.id }),
	];

	if (mode !== "none") {
		transactions.push(
			db.tx.templates[id()]
				.create({ type, text, notes: notes || undefined, mode, interval, unit, anchor })
				.link({ user: user.id, instance: itemId }),
		);
	}

	db.transact(transactions);
};

export const createEvent = (
	text: string,
	notes: string,
	date: Temporal.PlainDate,
	start: Temporal.PlainTime | undefined,
	end: Temporal.PlainTime | undefined,
	mode: Mode,
	interval: number,
	unit: Unit,
	anchor: string,
	user: { id: string },
) => {
	const type = "event";
	const itemId = id();

	const transactions: any[] = [
		db.tx.items[itemId]
			.create({ type, text, notes: notes || undefined, date: date.toString(), start: start?.toString(), end: end?.toString() })
			.link({ user: user.id }),
	];

	if (mode !== "none") {
		transactions.push(
			db.tx.templates[id()]
				.create({
					type,
					text,
					notes: notes || undefined,
					start: start?.toString(),
					end: end?.toString(),
					mode,
					interval,
					unit,
					anchor,
				})
				.link({ user: user.id, instance: itemId }),
		);
	}

	db.transact(transactions);
};

export const completeTodo = (todo: Item, user: { id: string }, template?: Template) => {
	const { type, text, date } = todo;
	const transactions: any[] = [db.tx.items[todo.id].delete()];

	if (template) {
		const newDate = nextDate(date, template);
		db.transact([
			db.tx.items[id()]
				.create({ type, text, notes: template.notes || undefined, date: newDate.toString() })
				.link({ user: user.id, template: template.id }),
		]);
	}

	db.transact(transactions);
};

export const updateInstance = (
	item: { id: string },
	{ text, notes, date, start, end }: { text: string; notes: string; date: Temporal.PlainDate; start?: Temporal.PlainTime; end?: Temporal.PlainTime },
) => {
	db.transact([
		db.tx.items[item.id].update({
			text,
			notes: notes || undefined,
			date: date.toString(),
			start: start?.toString(),
			end: end?.toString(),
		}),
	]);
};

export const updateTemplate = (
	template: { id: string },
	form: { type: string; text: string; notes: string; start?: Temporal.PlainTime; end?: Temporal.PlainTime; mode: Mode; interval: number; unit: Unit; anchor: string },
) => {
	db.transact([
		db.tx.templates[template.id].update({
			type: form.type,
			text: form.text,
			notes: form.notes || undefined,
			start: form.start?.toString(),
			end: form.end?.toString(),
			mode: form.mode,
			interval: form.interval,
			unit: form.unit,
			anchor: form.anchor,
		}),
	]);
};

// For non-repeating items: updates item fields and handles creating/updating/deleting the template
export const updateItem = (
	item: { id: string },
	form: { type: string; text: string; notes: string; date: Temporal.PlainDate; start?: Temporal.PlainTime; end?: Temporal.PlainTime; mode: Mode; interval: number; unit: Unit; anchor: string },
	template: Template | undefined,
	user: { id: string },
) => {
	const transactions: any[] = [
		db.tx.items[item.id].update({
			type: form.type,
			text: form.text,
			notes: form.notes || undefined,
			date: form.date.toString(),
			start: form.start?.toString(),
			end: form.end?.toString(),
		}),
	];

	if (template) {
		if (form.mode !== "none") {
			transactions.push(
				db.tx.templates[template.id].update({
					type: form.type,
					text: form.text,
					notes: form.notes || undefined,
					mode: form.mode,
					interval: form.interval,
					unit: form.unit,
					anchor: form.anchor,
					start: form.start?.toString(),
					end: form.end?.toString(),
				}),
			);
		} else {
			transactions.push(db.tx.templates[template.id].delete());
		}
	} else if (form.mode !== "none") {
		transactions.push(
			db.tx.templates[id()]
				.create({
					type: form.type,
					text: form.text,
					notes: form.notes || undefined,
					mode: form.mode,
					interval: form.interval,
					unit: form.unit,
					anchor: form.anchor,
					start: form.start?.toString(),
					end: form.end?.toString(),
				})
				.link({ user: user.id, instance: item.id }),
		);
	}

	db.transact(transactions);
};

export const skipInstance = (item: Item, template: Template, user: { id: string }) => {
	const newDate = nextDate(item.date, template);
	db.transact([
		db.tx.items[id()]
			.create({
				type: template.type,
				text: template.text,
				notes: template.notes || undefined,
				date: newDate.toString(),
				start: template.start?.toString(),
				end: template.end?.toString(),
			})
			.link({ user: user.id, template: template.id }),
		db.tx.items[item.id].delete(),
	]);
};

export const deleteItem = (item: Item) => {
	db.transact([db.tx.items[item.id].delete()]);
};

export const deleteTemplate = (template: Template) => {
	db.transact([db.tx.templates[template.id].delete()]);
};
