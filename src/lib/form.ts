import { Temporal } from "temporal-polyfill";

export const TYPES = ["todo", "event"];
export const MODES = ["none", "absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;
export const WEEK_DAYS = ["m", "t", "w", "t", "f", "s", "s"] as const;
export const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export type ItemType = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

export type FormState = {
	type: ItemType;
	text: string;
	date: Temporal.PlainDate;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: string;
};
