import { id, init, TransactionChunk, User } from "@instantdb/solidjs";
import schema from "../instant.schema";
import {
	FlatGroup,
	FlatItem,
	FlatTemplate,
	Group,
	Item,
	serializeItem,
	serializeItemUpdate,
	serializeTemplate,
	serializeTemplateUpdate,
	Template,
	Vision,
} from "./types";
import { nextDate } from "./repeat";
import { Temporal } from "temporal-polyfill";

export const db = init({
	appId: import.meta.env.VITE_INSTANT_APP_ID!,
	schema,
});

export const createItem = (
	item: Omit<FlatItem, "id">,
	user: User,
	template?: Omit<FlatTemplate, "id" | "reference">,
	group?: Pick<FlatGroup, "id">,
) => {
	const itemId = id();
	const transactions: TransactionChunk<typeof schema, any>[] = [];

	transactions.push(db.tx.items[itemId].create(serializeItem(item)).link({ user: user.id }));

	if (template) {
		transactions.push(
			db.tx.templates[id()]
				.create(
					serializeTemplate({
						...template,
						reference: template.mode === "absolute" ? item.date : undefined,
					}),
				)
				.link({ user: user.id, instance: itemId }),
		);
	}

	if (group) {
		db.transact(transactions.map((t) => t.link({ group: group.id })));
	} else {
		db.transact(transactions);
	}
};

export const updateItem = (item: Item, update: Partial<Omit<FlatItem, "id">>) => {
	db.transact(db.tx.items[item.id].update(serializeItemUpdate(update)));
};

export const updateTemplate = (
	template: Template,
	update: Partial<Omit<FlatTemplate, "id" | "reference">>,
) => {
	db.transact(db.tx.templates[template.id].update(serializeTemplateUpdate(update)));
};

export const deleteItem = (item: Item) => {
	if (item.template === undefined) {
		db.transact(db.tx.items[item.id].delete());
		return;
	}

	const { template } = item;
	db.transact(
		db.tx.items[item.id].update(
			serializeItemUpdate({
				type: template.type,
				text: template.text,
				date: nextDate(item.date, template),
				start: template.start,
				end: template.end,
				notes: template.notes,
			}),
		),
	);
};

export const deleteTemplate = (template: Template) => {
	db.transact(db.tx.templates[template.id].delete());
};

export const createGroup = (name: string, active: boolean, user: User) => {
	db.transact(db.tx.groups[id()].create({ name, active }).link({ user: user.id }));
};

export const updateGroup = (
	project: Group,
	update: { name?: string; notes?: string | null; active?: boolean },
) => {
	db.transact(db.tx.groups[project.id].update(update));
};

export const deleteGroup = (group: Group) => {
	db.transact(db.tx.groups[group.id].delete());
};

export const linkItemGroup = (itemId: string, groupId: string) => {
	db.transact(db.tx.items[itemId].link({ group: groupId }));
};

export const unlinkItemGroup = (itemId: string, groupId: string) => {
	db.transact(db.tx.items[itemId].unlink({ group: groupId }));
};

export const linkTemplateGroup = (templateId: string, groupId: string) => {
	db.transact(db.tx.templates[templateId].link({ group: groupId }));
};

export const unlinkTemplateGroup = (templateId: string, groupId: string) => {
	db.transact(db.tx.templates[templateId].unlink({ group: groupId }));
};

export const createVision = (text: string, user: User) => {
	db.transact(db.tx.visions[id()].create({ text }).link({ user: user.id }));
};

export const updateVision = (vision: Vision, text: string) => {
	db.transact(db.tx.visions[vision.id].update({ text }));
};

export const saveReminder = (
	vision: Vision,
	date: Temporal.PlainDate,
	order: string,
	user: User,
) => {
	const { reminder } = vision;

	if (reminder && Temporal.PlainDate.compare(reminder.date, Temporal.Now.plainDateISO()) >= 0) {
		db.transact(db.tx.items[reminder.id].update(serializeItemUpdate({ date })));
		return;
	}

	const reminderId = id();
	db.transact([
		db.tx.items[reminderId]
			.create(serializeItem({ type: "todo", text: "Revisit vision", date, order }))
			.link({ user: user.id }),
		db.tx.visions[vision.id].link({ reminder: reminderId }),
	]);
};
