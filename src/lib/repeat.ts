import { Item, Repeat, Template } from "./types";
import { Temporal } from "temporal-polyfill";
import { advanceDate } from "./dates";

const nextCycleDate = (
	date: Temporal.PlainDate,
	reference: Temporal.PlainDate,
	interval: number,
	anchor: number[],
	periodStart: (d: Temporal.PlainDate) => Temporal.PlainDate,
	diff: (ref: Temporal.PlainDate, cur: Temporal.PlainDate) => number,
	advance: (start: Temporal.PlainDate, n: number) => Temporal.PlainDate,
	place: (start: Temporal.PlainDate, anchor: number) => Temporal.PlainDate,
): Temporal.PlainDate => {
	const curStart = periodStart(date);
	const refStart = periodStart(reference);
	const periods = diff(refStart, curStart);
	const remainder = ((periods % interval) + interval) % interval;

	if (remainder === 0) {
		for (const a of anchor) {
			const candidate = place(curStart, a);
			if (Temporal.PlainDate.compare(candidate, date) > 0) return candidate;
		}
	}
	return place(advance(curStart, interval - remainder), anchor[0]);
};

export const nextDate = (date: Temporal.PlainDate, repeat: Repeat): Temporal.PlainDate => {
	if (repeat.mode === "relative" || repeat.unit === "day") {
		return advanceDate(date, repeat.interval, repeat.unit);
	}

	const { unit, interval, anchor, reference } = repeat;

	if (unit === "week") {
		return nextCycleDate(
			date, reference, interval, anchor,
			(d) => d.subtract({ days: d.dayOfWeek - 1 }),
			(ref, cur) => ref.until(cur, { largestUnit: "weeks" }).weeks,
			(start, n) => start.add({ weeks: n }),
			(start, a) => start.add({ days: a }),
		);
	}

	return nextCycleDate(
		date, reference, interval, anchor,
		(d) => d.with({ day: 1 }),
		(ref, cur) => ref.until(cur, { largestUnit: "months" }).months,
		(start, n) => start.add({ months: n }),
		(start, a) => start.with({ day: Math.min(a + 1, start.daysInMonth) }),
	);
};

const toVirtualItem = (template: Template & { instance?: Item }, date: Temporal.PlainDate): Item => {
	const instance = template.instance!;
	const base = { id: template.id, text: template.text, notes: template.notes, date, order: instance.order };
	if (template.type === "event") {
		return { ...base, type: "event", start: template.start, end: template.end };
	}
	return { ...base, type: "todo" };
};

export const generateVirtualItems = (
	template: Template & { instance?: Item },
	after: Temporal.PlainDate,
	until: Temporal.PlainDate,
): Item[] => {
	if (!template.instance) return [];

	const type = template.instance.type;
	let date = nextDate(after, template);

	if (type === "todo") {
		return Temporal.PlainDate.compare(date, until) <= 0 ? [toVirtualItem(template, date)] : [];
	}

	const items: Item[] = [];
	while (Temporal.PlainDate.compare(date, until) <= 0) {
		items.push(toVirtualItem(template, date));
		date = nextDate(date, template);
	}
	return items;
};
