import { Temporal } from "temporal-polyfill";
import type { RawItem, RawTemplate, Item, Template } from "./types";

export const today = (): Temporal.PlainDate => Temporal.Now.plainDateISO();
export const now = (): Temporal.PlainTime =>
	Temporal.Now.plainTimeISO().round({ smallestUnit: "minute" });

export const toDate = (s: string): Temporal.PlainDate => Temporal.PlainDate.from(s);
export const toTime = (s: string): Temporal.PlainTime =>
	Temporal.PlainTime.from(s).round({ smallestUnit: "minute", roundingMode: "trunc" });

export const advanceDate = (
	date: Temporal.PlainDate,
	interval: number,
	unit: string,
): Temporal.PlainDate => {
	if (unit === "week") return date.add({ weeks: interval });
	if (unit === "month") return date.add({ months: interval });
	return date.add({ days: interval });
};

export const parseItem = (raw: RawItem): Item => ({
	...raw,
	date: toDate(raw.date),
	start: raw.start ? toTime(raw.start) : undefined,
	end: raw.end ? toTime(raw.end) : undefined,
});

export const parseTemplate = (raw: RawTemplate): Template => ({
	...raw,
	start: raw.start ? toTime(raw.start) : undefined,
	end: raw.end ? toTime(raw.end) : undefined,
});
