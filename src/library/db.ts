import { init } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Item } from "./types";

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
