import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import { parsePlainDate, parsePlainTime } from "./dates";

export const TYPES = ["todo", "event"] as const;
export const MODES = ["absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;

export type Type = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

type DatabaseItem = InstaQLEntity<typeof schema, "items", { template: {} }>;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates", { instance: {} }>;

type RelativeRepeat = { mode: "relative"; unit: Unit; interval: number };
type AbsoluteRepeat = { mode: "absolute"; unit: Unit; interval: number; anchor: number[]; reference: Temporal.PlainDate };
export type Repeat = RelativeRepeat | AbsoluteRepeat;

type LinkedTodo = { id: string; type: "todo"; date: Temporal.PlainDate; text: string; notes?: string; order?: string };
type LinkedEvent = { id: string; type: "event"; date: Temporal.PlainDate; text: string; notes?: string; order?: string; start?: Temporal.PlainTime; end?: Temporal.PlainTime };
type LinkedItem = LinkedTodo | LinkedEvent;

type LinkedTodoTemplate = Repeat & { id: string; type: "todo"; text: string; notes?: string };
type LinkedEventTemplate = Repeat & { id: string; type: "event"; text: string; notes?: string; start?: Temporal.PlainTime; end?: Temporal.PlainTime };
type LinkedTemplate = LinkedTodoTemplate | LinkedEventTemplate;

export type TodoTemplate = LinkedTodoTemplate & { instance?: LinkedItem };
export type EventTemplate = LinkedEventTemplate & { instance?: LinkedItem };
export type Template = TodoTemplate | EventTemplate;
export type Todo = LinkedTodo & { template?: LinkedTemplate };
export type Event = LinkedEvent & { template?: LinkedTemplate };
export type Item = Todo | Event;

const parseRepeat = (raw: { mode: string; unit: string; interval: number; anchor?: unknown; reference?: string }): Repeat => {
	const mode = raw.mode as Mode;
	const unit = raw.unit as Unit;
	if (mode === "absolute") {
		return {
			mode,
			unit,
			interval: raw.interval,
			anchor: (raw.anchor as number[]) ?? [],
			reference: parsePlainDate(raw.reference!),
		};
	}
	return { mode, unit, interval: raw.interval };
};

const parseLinkedItem = (raw: NonNullable<DatabaseTemplate["instance"]>): LinkedItem => {
	const base = {
		id: raw.id,
		text: raw.text,
		notes: raw.notes || undefined,
		date: parsePlainDate(raw.date),
		order: raw.order || undefined,
	};
	if (raw.type === "event") {
		return {
			...base,
			type: "event",
			start: raw.start ? parsePlainTime(raw.start) : undefined,
			end: raw.end ? parsePlainTime(raw.end) : undefined,
		};
	}
	return { ...base, type: "todo" };
};

const parseLinkedTemplate = (raw: NonNullable<DatabaseItem["template"]>): LinkedTemplate => {
	const base = {
		id: raw.id,
		...parseRepeat(raw),
		text: raw.text,
		notes: raw.notes || undefined,
	};
	if (raw.type === "event") {
		return {
			...base,
			type: "event",
			start: raw.start ? parsePlainTime(raw.start) : undefined,
			end: raw.end ? parsePlainTime(raw.end) : undefined,
		};
	}
	return { ...base, type: "todo" };
};

export const parseItem = (raw: DatabaseItem): Item => {
	const template = raw.template ? parseLinkedTemplate(raw.template) : undefined;
	const base = {
		id: raw.id,
		text: raw.text,
		notes: raw.notes || undefined,
		date: parsePlainDate(raw.date),
		order: raw.order || undefined,
		template,
	};
	if (raw.type === "event") {
		return {
			...base,
			type: "event",
			start: raw.start ? parsePlainTime(raw.start) : undefined,
			end: raw.end ? parsePlainTime(raw.end) : undefined,
		};
	}
	return { ...base, type: "todo" };
};

export const parseTemplate = (raw: DatabaseTemplate): Template => {
	const base = {
		id: raw.id,
		...parseRepeat(raw),
		text: raw.text,
		notes: raw.notes || undefined,
		instance: raw.instance ? parseLinkedItem(raw.instance) : undefined,
	};
	if (raw.type === "event") {
		return {
			...base,
			type: "event",
			start: raw.start ? parsePlainTime(raw.start) : undefined,
			end: raw.end ? parsePlainTime(raw.end) : undefined,
		};
	}
	return { ...base, type: "todo" };
};
