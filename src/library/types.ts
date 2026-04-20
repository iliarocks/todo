import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";

export const TYPES = ["todo", "event"] as const;
export const MODES = ["absolute", "relative"] as const;
export const UNITS = ["day", "week", "month"] as const;

export type Type = (typeof TYPES)[number];
export type Mode = (typeof MODES)[number];
export type Unit = (typeof UNITS)[number];

type DatabaseItem = InstaQLEntity<typeof schema, "items">;
type DatabaseTemplate = InstaQLEntity<typeof schema, "templates">;
type DatabaseGroup = InstaQLEntity<typeof schema, "groups">;
type DatabaseVision = InstaQLEntity<typeof schema, "visions">;

type Override<T, U> = Omit<T, keyof U> & U;

export type FlatItem = Omit<Item, "template" | "group">;
export type FlatTemplate = Omit<Template, "instance" | "group">;
export type FlatGroup = Omit<Group, "templates" | "items">;

export type Item = Override<
	DatabaseItem,
	{
		type: Type;
		date: Temporal.PlainDate;
		start?: Temporal.PlainTime;
		end?: Temporal.PlainTime;
	}
> & { template?: FlatTemplate; group?: FlatGroup };

export type Template = Override<
	DatabaseTemplate,
	{
		type: Type;
		start?: Temporal.PlainTime;
		end?: Temporal.PlainTime;
		mode: Mode;
		unit: Unit;
		anchor: number[];
		reference?: Temporal.PlainDate;
	}
> & { instance: FlatItem; group?: FlatGroup };

export type Vision = DatabaseVision & { reminder?: FlatItem };

export type Group = DatabaseGroup & {
	items: FlatItem[];
	templates: FlatTemplate[];
};

const parseFlatItem = (base: DatabaseItem): FlatItem => ({
	...base,
	type: base.type as Type,
	date: Temporal.PlainDate.from(base.date),
	start: base.start ? Temporal.PlainTime.from(base.start) : undefined,
	end: base.end ? Temporal.PlainTime.from(base.end) : undefined,
});

const parseFlatTemplate = (base: DatabaseTemplate): FlatTemplate => ({
	...base,
	type: base.type as Type,
	start: base.start ? Temporal.PlainTime.from(base.start) : undefined,
	end: base.end ? Temporal.PlainTime.from(base.end) : undefined,
	mode: base.mode as Mode,
	unit: base.unit as Unit,
	anchor: base.anchor as number[],
	reference: base.reference ? Temporal.PlainDate.from(base.reference) : undefined,
});

export const parseItem = (
	base: DatabaseItem & { template?: DatabaseTemplate; group?: DatabaseGroup },
): Item => ({
	...parseFlatItem(base),
	template: base.template ? parseFlatTemplate(base.template) : undefined,
	group: base.group,
});

export const parseTemplate = (
	base: DatabaseTemplate & {
		instance: DatabaseItem;
		group?: DatabaseGroup;
	},
): Template => {
	return {
		...parseFlatTemplate(base),
		instance: parseFlatItem(base.instance),
		group: base.group,
	};
};

export const parseTemplates = (
	templates: ReadonlyArray<DatabaseTemplate & { instance?: DatabaseItem; group?: DatabaseGroup }>,
): Template[] => {
	return templates
		.filter((r) => r.instance)
		.map((r) => parseTemplate(r as Parameters<typeof parseTemplate>[0]));
};

export const parseVision = (base: DatabaseVision & { reminder?: DatabaseItem }): Vision => ({
	...base,
	reminder: base.reminder ? parseFlatItem(base.reminder) : undefined,
});

export const parseGroup = (
	base: DatabaseGroup & {
		items?: DatabaseItem[];
		templates?: DatabaseTemplate[];
	},
): Group => {
	return {
		...base,
		items: (base.items ?? []).map(parseFlatItem),
		templates: (base.templates ?? []).map(parseFlatTemplate),
	};
};

export const serializeItem = (item: Omit<FlatItem, "id">) => ({
	...item,
	date: item.date.toString(),
	start: item.start?.toString(),
	end: item.end?.toString(),
});

export const serializeItemUpdate = (update: Partial<Omit<FlatItem, "id">>) => {
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

export const serializeTemplate = (template: Omit<FlatTemplate, "id">) => ({
	...template,
	start: template.start?.toString(),
	end: template.end?.toString(),
	reference: template.reference?.toString(),
	anchor: template.anchor ? [...template.anchor] : undefined,
});

export const serializeTemplateUpdate = (update: Partial<Omit<FlatTemplate, "id">>) => {
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
