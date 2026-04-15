import { Temporal } from "temporal-polyfill";
import { Item, Template } from "./types";
import { advanceDate } from "./date";

const nextWeekDate = (
	date: Temporal.PlainDate,
	reference: Temporal.PlainDate,
	interval: number,
	anchor: number[],
): Temporal.PlainDate => {
	const curStart = date.subtract({ days: date.dayOfWeek - 1 });
	const refStart = reference.subtract({ days: reference.dayOfWeek - 1 });
	const weeks = refStart.until(curStart, { largestUnit: "weeks" }).weeks;
	const remainder = ((weeks % interval) + interval) % interval;

	if (remainder === 0) {
		for (const a of anchor) {
			const candidate = curStart.add({ days: a });
			if (Temporal.PlainDate.compare(candidate, date) > 0) return candidate;
		}
	}

	return curStart.add({ weeks: interval - remainder, days: anchor[0] });
};

const nextMonthDate = (
	date: Temporal.PlainDate,
	reference: Temporal.PlainDate,
	interval: number,
	anchor: number[],
): Temporal.PlainDate => {
	const curStart = date.with({ day: 1 });
	const refStart = reference.with({ day: 1 });
	const months = refStart.until(curStart, { largestUnit: "months" }).months;
	const remainder = ((months % interval) + interval) % interval;

	if (remainder === 0) {
		for (const a of anchor) {
			const candidate = curStart.with({ day: Math.min(a + 1, curStart.daysInMonth) });
			if (Temporal.PlainDate.compare(candidate, date) > 0) return candidate;
		}
	}

	const nextStart = curStart.add({ months: interval - remainder });
	return nextStart.with({ day: Math.min(anchor[0] + 1, nextStart.daysInMonth) });
};

export const nextDate = (date: Temporal.PlainDate, template: Template): Temporal.PlainDate => {
	if (template.mode === "relative" || template.unit === "day") {
		return advanceDate(date, template.interval, template.unit);
	}

	const { unit, interval, anchor, reference } = template;

	if (unit === "week") {
		return nextWeekDate(date, reference!, interval, anchor!);
	}

	return nextMonthDate(date, reference!, interval, anchor!);
};

const toVirtualItem = (template: Template & { instance: Item }, date: Temporal.PlainDate): Item => ({
	id: template.id,
	type: template.type,
	text: template.text,
	notes: template.notes,
	date,
	order: template.instance.order,
	start: template.start,
	end: template.end,
});

export const generateVirtualItems = (
	template: Template & { instance: Item },
	after: Temporal.PlainDate,
	until: Temporal.PlainDate,
): Item[] => {
	let date = nextDate(after, template);

	if (template.type === "todo") {
		return Temporal.PlainDate.compare(date, until) <= 0 ? [toVirtualItem(template, date)] : [];
	}

	const items: Item[] = [];
	while (Temporal.PlainDate.compare(date, until) <= 0) {
		items.push(toVirtualItem(template, date));
		date = nextDate(date, template);
	}
	return items;
};
