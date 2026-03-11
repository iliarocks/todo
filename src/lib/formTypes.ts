export const MODES = ["none", "absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;
export const WEEK_DAYS = ["s", "m", "t", "w", "t", "f", "s"] as const;
export const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export type FormType = "todo" | "event";
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

export type FormState = {
	type: FormType;
	text: string;
	date: string;
	startTime: string;
	endTime: string;
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: string;
};
