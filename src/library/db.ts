import { id, init } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Item, Template } from "./types";
import { nextDate } from "./repeat";

export const db = init({
	appId: import.meta.env.VITE_INSTANT_APP_ID!,
	schema,
});

export const updateItem = (item: Item, update: Partial<Item>) => {
	const { date, start, end } = update;

	const changes = {
		...update,
		date: date ? date.toString() : undefined,
		start: start ? start.toString() : undefined,
		end: end ? end.toString() : undefined,
	}

	db.transact(db.tx.items[item.id].update(changes));
}

export const deleteItem = (item: Item & { template?: Template }, user: { id: string }) => {
	if (item.template === undefined) {
		db.transact([db.tx.items[item.id].delete()]);
		return;
	}

	const template = item.template;
	const date = nextDate(item.date, template);
	db.transact([
		db.tx.items[id()]
			.create({
				type: template.type,
				text: template.text,
				date: date.toString(),
				start: template.type === "event" ? (template as Template).start?.toString() : undefined,
				end: template.type === "event" ? (template as Template).end?.toString() : undefined,
				notes: template.notes,
				order: item.order,
			})
			.link({ user: user.id, template: template.id }),
		db.tx.items[item.id].delete(),
	]);
};
