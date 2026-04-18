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

type DatabaseItem = InstaQLEntity<typeof schema, "items">;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates">;
type DatabaseProject = InstaQLEntity<typeof schema, "projects">;
type DatabaseVision = InstaQLEntity<typeof schema, "visions">;

type BaseItem = {
	id: string;
	type: Type;
	text: string;
	date: Temporal.PlainDate;
	notes?: string;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	order: string;
};

type BaseTemplate = {
	id: string;
	type: Type;
	text: string;
	notes?: string;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	mode: Mode;
	unit: Unit;
	interval: number;
	anchor?: number[];
	reference?: Temporal.PlainDate;
};

export type Item = BaseItem & {
	template?: BaseTemplate;
	project?: DatabaseProject;
};

export type Template = BaseTemplate & {
	instance: Item;
	project?: DatabaseProject;
};

export type Project = DatabaseProject & {
	items: Item[];
	templates: Template[];
};

export type Vision = {
	id: string;
	text: string;
	reminder?: Item;
};

const parseBaseItem = (base: DatabaseItem): BaseItem => ({
	...base,
	type: base.type as Type,
	date: parseDate(base.date),
	start: base.start ? parseTime(base.start) : undefined,
	end: base.end ? parseTime(base.end) : undefined,
});

const parseBaseTemplate = (base: DatabaseTemplate): BaseTemplate => ({
	...base,
	type: base.type as Type,
	start: base.start ? parseTime(base.start) : undefined,
	end: base.end ? parseTime(base.end) : undefined,
	mode: base.mode as Mode,
	unit: base.unit as Unit,
	reference: base.reference ? parseDate(base.reference) : undefined,
});

export const parseItem = (
	base: DatabaseItem & { template?: DatabaseTemplate; project?: DatabaseProject },
): Item => ({
	...parseBaseItem(base),
	template: base.template ? parseBaseTemplate(base.template) : undefined,
	project: base.project,
});

export const parseTemplate = (
	base: DatabaseTemplate & {
		instance?: DatabaseItem;
		project?: DatabaseProject;
	},
): Template | undefined => {
	if (base.instance === undefined) return undefined;

	return {
		...parseBaseTemplate(base),
		instance: parseBaseItem(base.instance),
		project: base.project,
	};
};

export const parseVision = (base: DatabaseVision & { reminder?: DatabaseItem }): Vision => ({
	...base,
	reminder: base.reminder ? parseItem(base.reminder) : undefined,
});

export const parseProject = (
	base: DatabaseProject & {
		items?: DatabaseItem[];
		templates?: DatabaseTemplate[];
	},
): Project => {
	return {
		...base,
		items: (base.items ?? []).map((i) => parseItem(i)),
		templates: (base.templates ?? []).map(parseTemplate).filter((t) => t !== undefined),
	};
};

export const serializeItem = (item: Omit<BaseItem, "id">) => ({
	...item,
	date: item.date.toString(),
	start: item.start?.toString(),
	end: item.end?.toString(),
});

export const serializeItemUpdate = (update: Partial<Omit<BaseItem, "id">>) => {
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

export const serializeTemplate = (template: Omit<BaseTemplate, "id">) => ({
	...template,
	start: template.start?.toString(),
	end: template.end?.toString(),
	reference: template.reference?.toString(),
	anchor: template.anchor ? [...template.anchor] : undefined,
});

export const serializeTemplateUpdate = (update: Partial<Omit<BaseTemplate, "id">>) => {
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
