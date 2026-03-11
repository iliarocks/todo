import { id } from "@instantdb/solidjs";
import { parse, startOfDay } from "date-fns";
import { db } from "./db";
import { Item } from "./types";
import { nextOccurrenceDate } from "./repeat";
import { FormState } from "./formTypes";

export const createTodo = (text: string, date: string, userId: string) => {
	if (!text || !date) return;

	db.transact(db.tx.items[id()].create({ type: "todo", text, date }).link({ user: userId }));
};

export const createEvent = (
	text: string,
	date: string,
	startTime: string,
	endTime: string,
	userId: string,
) => {
	if (!text || !date || !startTime || !endTime) return;

	db.transact(
		db.tx.items[id()]
			.create({ type: "event", text, date, startTime, endTime })
			.link({ user: userId }),
	);
};

export const createRepeatingTodo = (
	text: string,
	date: string,
	mode: "relative" | "absolute",
	interval: number,
	unit: "day" | "week" | "month",
	anchor: string,
	userId: string,
) => {
	if (!text || !date) return;

	const templateId = id();
	db.transact([
		db.tx.templates[templateId]
			.create({ text, type: "todo", mode, interval, unit, anchor })
			.link({ user: userId }),
		db.tx.items[id()]
			.create({ type: "todo", text, date })
			.link({ template: templateId, user: userId }),
	]);
};

export const completeTodo = (todo: Item, userId: string) => {
	const template = todo.template;
	if (template) {
		const nextDate = nextOccurrenceDate(template, todo.date);
		db.transact([
			db.tx.items[id()]
				.create({ type: "todo", text: todo.text, date: startOfDay(nextDate).toISOString() })
				.link({ template: template.id, user: userId }),
			db.tx.log[id()].create({ type: "todo", text: todo.text, date: todo.date }).link({ user: userId }),
			db.tx.items[todo.id].delete(),
		]);
	} else {
		db.transact([
			db.tx.log[id()].create({ type: "todo", text: todo.text, date: todo.date }).link({ user: userId }),
			db.tx.items[todo.id].delete(),
		]);
	}
};

export const updateItem = (item: Item, form: FormState, userId: string) => {
	const date = startOfDay(parse(form.date, "yyyy-MM-dd", new Date())).toISOString();
	const txns: any[] = [];

	if (form.mode === "none") {
		const updates = {
			text: form.text,
			date,
			...(form.type === "event" && { startTime: form.startTime, endTime: form.endTime }),
		};
		txns.push(db.tx.items[item.id].update(updates));
		if (item.template) txns.push(db.tx.templates[item.template.id].delete());
	} else {
		const templateData = {
			text: form.text,
			type: form.type,
			mode: form.mode,
			interval: form.interval,
			unit: form.unit,
			anchor: form.anchor,
			...(form.type === "event" && { startTime: form.startTime, endTime: form.endTime }),
		};
		const itemData = {
			text: form.text,
			date,
			...(form.type === "event" && { startTime: form.startTime, endTime: form.endTime }),
		};

		if (item.template) {
			txns.push(db.tx.templates[item.template.id].update(templateData));
			txns.push(db.tx.items[item.id].update(itemData));
		} else {
			const templateId = id();
			txns.push(db.tx.templates[templateId].create(templateData).link({ user: userId }));
			txns.push(db.tx.items[item.id].update(itemData).link({ template: templateId }));
		}
	}

	db.transact(txns);
};

export const deleteItem = (item: Item) => {
	const txns: any[] = [db.tx.items[item.id].delete()];
	if (item.template) txns.push(db.tx.templates[item.template.id].delete());
	db.transact(txns);
};

export const createRepeatingEvent = (
	text: string,
	date: string,
	mode: "relative" | "absolute",
	interval: number,
	unit: "day" | "week" | "month",
	anchor: string,
	startTime: string,
	endTime: string,
	userId: string,
) => {
	if (!text || !date || !startTime || !endTime) return;

	const templateId = id();
	db.transact([
		db.tx.templates[templateId]
			.create({ text, type: "event", mode, interval, unit, anchor, startTime, endTime })
			.link({ user: userId }),
		db.tx.items[id()]
			.create({ type: "event", text, date, startTime, endTime })
			.link({ template: templateId, user: userId }),
	]);
};
