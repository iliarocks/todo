import { id } from "@instantdb/solidjs";
import { startOfDay } from "date-fns";
import { db } from "./db";
import { Item } from "./types";
import { nextOccurrenceDate } from "./repeat";

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
	userId: string,
) => {
	if (!text || !date) return;

	const templateId = id();
	db.transact([
		db.tx.templates[templateId]
			.create({ text, type: "todo", mode, interval, unit })
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
