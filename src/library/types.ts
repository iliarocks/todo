import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import { parseDate, parseTime } from "./date";

export const TYPES = ["todo", "event"];
export const MODES = ["absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;

export type Type = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

export type PlainDate = Temporal.PlainDate;
export type PlainTime = Temporal.PlainTime;

type DatabaseItem = InstaQLEntity<typeof schema, "items">;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates">;

export type Item = {
	id: string;
	type: Type;
	text: string;
	date: PlainDate;
	notes?: string;
	start?: PlainTime;
	end?: PlainTime;
	order: string;
};

export type Template = {
	id: string;
	type: Type;
	text: string;
	notes?: string;
	start?: PlainTime;
	end?: PlainTime;
	mode: Mode;
	unit: Unit;
	interval: number;
	anchor?: number[];
	reference?: Temporal.PlainDate;
};

export const parseItem = (base: DatabaseItem): Item => {
	const { type, date, start, end } = base;

	return {
		...base,
		type: type as Type,
		date: parseDate(date),
		start: start ? parseTime(start) : undefined,
		end: end ? parseTime(end) : undefined,
	};
};

export const parseTemplate = (base: DatabaseTemplate): Template => {
	const { type, start, end, mode, unit, reference } = base;

	return {
		...base,
		type: type as Type,
		start: start ? parseTime(start) : undefined,
		end: end ? parseTime(end) : undefined,
		mode: mode as Mode,
		unit: unit as Unit,
		reference: reference ? parseDate(reference) : undefined,
	};
};

export const parseItemWithTemplate = (base: DatabaseItem & { template?: DatabaseTemplate }): Item & { template?: Template } => ({
	...parseItem(base),
	template: base.template ? parseTemplate(base.template) : undefined,
});

export const parseTemplateWithInstance = (base: DatabaseTemplate & { instance?: DatabaseItem }): (Template & { instance: Item }) | null => {
	if (!base.instance) return null;
	return { ...parseTemplate(base), instance: parseItem(base.instance) };
};
