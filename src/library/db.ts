import { id, init, User } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import {
	Item,
	Vision,
	serializeItem,
	serializeItemUpdate,
	serializeTemplate,
	serializeTemplateUpdate,
	Template,
} from "./types";
import { compareDate, today } from "./date";
import { nextDate } from "./repeat";

export const db = init({
	appId: import.meta.env.VITE_INSTANT_APP_ID!,
	schema,
});

export const createItem = (
	item: Omit<Item, "id">,
	user: User,
	template?: Omit<Template, "id" | "reference">,
) => {
	const itemId = id();
	const itemChunk = db.tx.items[itemId].create(serializeItem(item)).link({ user: user.id });

	if (template) {
		db.transact([
			itemChunk,
			db.tx.templates[id()]
				.create(
					serializeTemplate({
						...template,
						reference: template.mode === "absolute" ? item.date : undefined,
					}),
				)
				.link({ user: user.id, instance: itemId }),
		]);
	} else {
		db.transact(itemChunk);
	}
};

export const updateItem = (item: Item, update: Partial<Omit<Item, "id">>) => {
	db.transact(db.tx.items[item.id].update(serializeItemUpdate(update)));
};

export const updateTemplate = (
	template: Template,
	update: Partial<Omit<Template, "id" | "reference">>,
) => {
	db.transact(db.tx.templates[template.id].update(serializeTemplateUpdate(update)));
};

export const deleteItem = (item: Item & { template?: Template }) => {
	if (!item.template) {
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

	if (reminder && compareDate(reminder.date, today()) >= 0) {
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
