import { type Component, createEffect, on } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { deleteItem, updateItem } from "../library/db";
import { Item } from "../library/types";
import { useData } from "../context/data";
import { compareDate, compareTime, now, today } from "../library/date";

const isExpired = (item: Item) => {
	if (item.type === "event" && compareDate(item.date, today()) === 0 && item.end) {
		return compareTime(item.end, now()) < 0;
	}

	return compareDate(item.date, today()) < 0;
};

const Cleanup: Component = () => {
	const data = useData();
	const items = () =>
		data.items().filter((item) => compareDate(item.date, today().add({ days: 1 })) < 0);

	createEffect(
		on(items, (items) => {
			for (const item of items) {
				if (isExpired(item)) {
					if (item.type === "todo") updateItem(item, { date: Temporal.Now.plainDateISO() });
					if (item.type === "event") deleteItem(item);
				}
			}
		}),
	);

	return null;
};

export default Cleanup;
