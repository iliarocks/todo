import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import { parseDate, parseTime } from "./dates";

export const TYPES = ["todo", "event"] as const;
export const MODES = ["absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;

export type Type = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

type DatabaseItem = InstaQLEntity<typeof schema, "items">;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates">;

type QueryItem = InstaQLEntity<typeof schema, "items", { template: {} }>;
type QueryTemplate = InstaQLEntity<typeof schema, "templates", { instance: {} }>;

type RelativeRepeat = { mode: "relative"; unit: Unit; interval: number };
type AbsoluteRepeat = {
	mode: "absolute";
	unit: Unit;
	interval: number;
	anchor: number[];
	reference: Temporal.PlainDate;
};
export type Repeat = RelativeRepeat | AbsoluteRepeat;

export type Todo = {
	id: string;
	type: "todo";
	date: Temporal.PlainDate;
	text: string;
	notes?: string;
	order?: string;
};
export type Event = {
	id: string;
	type: "event";
	date: Temporal.PlainDate;
	text: string;
	notes?: string;
	order?: string;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
};
export type Item = Todo | Event;

export type TodoTemplate = Repeat & { id: string; type: "todo"; text: string; notes?: string };
export type EventTemplate = Repeat & {
	id: string;
	type: "event";
	text: string;
	notes?: string;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
};
export type Template = TodoTemplate | EventTemplate;

const ensure = <T extends string>(value: string, valid: readonly T[], label: string): T => {
	if (!(valid as readonly string[]).includes(value)) {
		throw new Error(`Invalid ${label}: "${value}"`);
	}

	return value as T;
};

const parseRepeat = (raw: {
	mode: string;
	unit: string;
	interval: number;
	anchor?: number[];
	reference?: string;
}): Repeat => {
	const mode = ensure(raw.mode, MODES, "mode");
	const unit = ensure(raw.unit, UNITS, "unit");
	const interval = raw.interval;

	if (mode === "absolute") {
		const reference = raw.reference;
		const anchor = raw.anchor;

		if (reference === undefined) {
			throw new Error("Missing reference date on absolute template");
		}

		if (anchor === undefined || (unit !== "day" && anchor.length === 0)) {
			throw new Error(`Missing or incorrect anchor`);
		}

		return { mode, unit, interval, anchor, reference: parseDate(reference) };
	}

	return { mode, unit, interval };
};

const parseItem = (raw: DatabaseItem): Item => {
	const type = ensure(raw.type, TYPES, "type");
	const base = {
		id: raw.id,
		text: raw.text,
		notes: raw.notes,
		date: parseDate(raw.date),
		order: raw.order,
	};

	if (type === "event") {
		return {
			type,
			start: raw.start ? parseTime(raw.start) : undefined,
			end: raw.end ? parseTime(raw.end) : undefined,
			...base,
		};
	}

	return { type, ...base };
};

const parseTemplate = (raw: DatabaseTemplate): Template => {
	const type = ensure(raw.type, TYPES, "type");
	const base = { id: raw.id, text: raw.text, notes: raw.notes, ...parseRepeat(raw) };

	if (type === "event") {
		return {
			type,
			start: raw.start ? parseTime(raw.start) : undefined,
			end: raw.end ? parseTime(raw.end) : undefined,
			...base,
		};
	}

	return { type, ...base };
};

export const parseItemWithTemplate = (raw: QueryItem): Item & { template?: Template } => {
	const item = parseItem(raw);
	const template = raw.template ? parseTemplate(raw.template) : undefined;
	return template ? { template, ...item } : item;
};

export const parseTemplateWithInstance = (raw: QueryTemplate): Template & { instance?: Item } => {
	const template = parseTemplate(raw);
	const instance = raw.instance ? parseItem(raw.instance) : undefined;
	return instance ? { instance, ...template } : template;
};
