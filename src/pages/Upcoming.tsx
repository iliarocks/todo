import {
	addDays,
	endOfMonth,
	endOfToday,
	format,
	max,
	min,
	startOfMonth,
	startOfToday,
	startOfWeek,
} from "date-fns";
import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import { advanceDate } from "../lib/repeat";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";
import { Item, Template } from "../lib/types";

const Upcoming: Component = () => {
	const state = db.useQuery({
		items: {
			$: {
				where: {
					and: [{ date: { $gte: endOfToday() } }, { date: { $lte: addDays(endOfToday(), 13) } }],
				},
			},
			template: {},
		},
		templates: {
			instance: {},
		},
	});
	const realItems = () => state().data?.items ?? [];
	const virtualItems = () => generateVirtualItems(state().data?.templates ?? []);
	const items = () =>
		[...realItems(), ...virtualItems()].sort((a, b) => a.date.getTime() - b.date.getTime());
	const itemsByDate = () => Object.groupBy(items(), (item) => format(item.date, "EEEE, MMMM d"));

	return (
		<Show when={!state().isLoading && !state().error}>
			<div class="flex flex-col gap-l">
				<For each={Object.entries(itemsByDate())}>
					{([date, itemGroup]) => {
						const [weekday, monthDay] = date.split(", ");
						return (
							<section class="flex flex-col gap-xs">
								<header class="flex justify-between px-xs text-[var(--secondary)]">
									<h2>{weekday}</h2>
									<h2>{monthDay}</h2>
								</header>
								<ul>
									<For each={itemGroup}>
										{(item) =>
											item.type === "todo" ? (
												<TodoItem todo={item} virtual={item.id.startsWith("virtual-")} />
											) : (
												<EventItem event={item} />
											)
										}
									</For>
								</ul>
							</section>
						);
					}}
				</For>
			</div>
		</Show>
	);
};

const virtualItem = (template: Template, date: Date): Item => ({
	id: `virtual-${template.id}-${date.getTime()}`,
	type: template.type,
	text: template.text,
	date,
	startTime: template.startTime,
	endTime: template.endTime,
	template: template,
});

const generateVirtualItems = (templates: Template[]): Item[] => {
	const start = endOfToday();
	const end = addDays(start, 13);
	const items: Item[] = [];

	for (const template of templates) {
		const referenceDate = max([template.instance!.date, startOfToday()]);

		if (template.mode === "relative") {
			const date = advanceDate(referenceDate, template.interval, template.unit);
			items.push(virtualItem(template, date));
		}

		if (template.mode === "absolute") {
			if (template.unit === "day") {
				let date = advanceDate(referenceDate, template.interval, "day");
				while (date <= end) {
					if (date >= start) items.push(virtualItem(template, date));
					date = advanceDate(date, template.interval, "day");
				}
			}

			const anchors = template.anchor!.split(" ").map(Number);

			if (template.unit === "week") {
				let week = startOfWeek(referenceDate);

				while (week <= end) {
					for (const day of anchors) {
						const date = addDays(week, day);
						if (date >= start && date <= end && date > referenceDate) {
							items.push(virtualItem(template, date));
						}
					}
					week = advanceDate(week, template.interval, "week");
				}
			}

			if (template.unit === "month") {
				let month = startOfMonth(referenceDate);

				while (month <= end) {
					for (const day of anchors) {
						const date = min([addDays(month, day), endOfMonth(month)]);
						if (date >= start && date <= end && date > referenceDate) {
							items.push(virtualItem(template, date));
						}
					}
					month = advanceDate(month, template.interval, "month");
				}
			}
		}
	}

	return items;
};

export default Upcoming;
