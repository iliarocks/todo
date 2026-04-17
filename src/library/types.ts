import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import { parseDate, parseTime } from "./date";

export const TYPES = ["todo", "event"] as const;
export const MODES = ["absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;

export type Type = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

export type PlainDate = Temporal.PlainDate;
export type PlainTime = Temporal.PlainTime;

type DatabaseItem = InstaQLEntity<typeof schema, "items">;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates">;
type DatabaseVision = InstaQLEntity<typeof schema, "visions">;
type DatabaseProject = InstaQLEntity<typeof schema, "projects">;

export type Vision = {
	id: string;
	text: string;
	reminder?: Item;
};

export type Project = {
	id: string;
	name: string;
	notes?: string;
	active: boolean;
	items: Item[];
	templates: (Template & { instance: Item })[];
};

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

const parseItem = (base: DatabaseItem): Item => {
	const { type, date, start, end } = base;

	return {
		...base,
		type: type as Type,
		date: parseDate(date),
		start: start ? parseTime(start) : undefined,
		end: end ? parseTime(end) : undefined,
	};
};

const parseTemplate = (base: DatabaseTemplate): Template => {
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

export const parseItemTemplate = (base: DatabaseItem & { template?: DatabaseTemplate }) => {
	const { template } = base;

	return {
		...parseItem(base),
		template: template ? parseTemplate(template) : undefined,
	};
};

export const parseTemplateInstance = (base: DatabaseTemplate & { instance?: DatabaseItem }) => {
	const { instance } = base;

	if (instance === undefined) return null;

	return {
		...parseTemplate(base),
		instance: parseItem(instance),
	};
};

export const parseVision = (base: DatabaseVision & { reminder?: DatabaseItem }): Vision => ({
	id: base.id,
	text: base.text,
	reminder: base.reminder ? parseItem(base.reminder) : undefined,
});

export const parseProject = (
	base: DatabaseProject & { items?: DatabaseItem[]; templates?: (DatabaseTemplate & { instance?: DatabaseItem })[] },
): Project => ({
	id: base.id,
	name: base.name,
	notes: base.notes ?? undefined,
	active: base.active,
	items: (base.items ?? []).map(parseItem),
	templates: (base.templates ?? []).flatMap((t) => {
		const parsed = parseTemplateInstance(t);
		return parsed ? [parsed] : [];
	}),
});

export const serializeItem = (item: Omit<Item, "id">) => ({
	...item,
	date: item.date.toString(),
	start: item.start?.toString(),
	end: item.end?.toString(),
});

export const serializeItemUpdate = (update: Partial<Omit<Item, "id">>) => {
	const output: Record<string, unknown> = {};
	if ("type" in update) output.type = update.type;
	if ("text" in update) output.text = update.text;
	if ("date" in update) output.date = update.date?.toString();
	if ("order" in update) output.order = update.order;
	if ("notes" in update) output.notes = update.notes ?? null;
	if ("start" in update) output.start = update.start?.toString() ?? null;
	if ("end" in update) output.end = update.end?.toString() ?? null;
	return output;
};

export const serializeTemplate = (template: Omit<Template, "id">) => ({
	...template,
	start: template.start?.toString(),
	end: template.end?.toString(),
	reference: template.reference?.toString(),
	anchor: template.anchor ? [...template.anchor] : undefined,
});

export const serializeTemplateUpdate = (update: Partial<Omit<Template, "id">>) => {
	const output: Record<string, unknown> = {};
	if ("type" in update) output.type = update.type;
	if ("text" in update) output.text = update.text;
	if ("mode" in update) output.mode = update.mode;
	if ("unit" in update) output.unit = update.unit;
	if ("interval" in update) output.interval = update.interval;
	if ("notes" in update) output.notes = update.notes ?? null;
	if ("start" in update) output.start = update.start?.toString() ?? null;
	if ("end" in update) output.end = update.end?.toString() ?? null;
	if ("anchor" in update) output.anchor = update.anchor ? [...update.anchor] : null;
	if ("reference" in update) output.reference = update.reference?.toString() ?? null;
	return output;
};
