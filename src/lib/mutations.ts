import { id } from "@instantdb/solidjs";
import { db } from "./db";

export const createTodo = (text: string, date: string) => {
	if (!text || !date) return;

	db.transact(db.tx.items[id()].create({ type: "todo", text, date }));
};

export const createEvent = (
	text: string,
	date: string,
	startTime: string,
	endTime: string,
) => {
	if (!text || !date || !startTime || !endTime) return;

	db.transact(
		db.tx.items[id()].create({
			type: "event",
			text,
			date,
			startTime,
			endTime,
		}),
	);
};

export const createRepeatingTodo = (
	text: string,
	date: string,
	mode: "relative" | "absolute",
	interval: number,
	unit: "day" | "week" | "month",
) => {
	if (!text || !date) return;

	const templateId = id();
	db.transact([
		db.tx.templates[templateId].create({
			text,
			type: "todo",
			mode,
			interval,
			unit,
		}),
		db.tx.items[id()]
			.create({ type: "todo", text, date })
			.link({ template: templateId }),
	]);
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
) => {
	if (!text || !date || !startTime || !endTime) return;

	const templateId = id();
	db.transact([
		db.tx.templates[templateId].create({
			text,
			type: "event",
			mode,
			interval,
			unit,
			anchor,
			startTime,
			endTime,
		}),
		db.tx.items[id()]
			.create({ type: "event", text, date, startTime, endTime })
			.link({ template: templateId }),
	]);
};
