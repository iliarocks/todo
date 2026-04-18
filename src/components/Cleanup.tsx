import { type Component, createEffect, on } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { deleteItem, updateItem } from "../library/db";
import { Item } from "../library/types";
import { compareDate, now, today } from "../library/date";
import { useData } from "../context/data";

const isExpired = (item: Item) => {
	if (item.type === "event" && Temporal.PlainDate.compare(item.date, today()) === 0 && item.end) {
		return Temporal.PlainTime.compare(item.end, now()) < 0;
	}

	return Temporal.PlainDate.compare(item.date, today()) < 0;
};

const Cleanup: Component = () => {
	const data = useData();
	const items = () => data.items().filter((item) => compareDate(item.date, today().add({ days: 1 })) < 0);

	createEffect(
		on(items, (items) => {
			for (const item of items) {
				if (isExpired(item)) {
					if (item.type === "todo") updateItem(item, { date: today() });
					if (item.type === "event") deleteItem(item);
				}
			}
		}),
	);

	return null;
};

export default Cleanup;
