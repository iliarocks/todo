import { Temporal } from "temporal-polyfill";
import { Component, For } from "solid-js";
import { generateVirtualItems } from "../library/repeat";
import { compareDate, today } from "../library/date";
import ListItem from "../components/ListItem";
import Empty from "../components/Empty";
import { useData } from "../context/data";

const Upcoming: Component = () => {
	const data = useData();
	const templates = () => data.templates();
	const templateIds = () => new Set(templates().map((t) => t.id));
	const items = () => {
		const real = data.items().filter((i) => compareDate(i.date, today()) > 0);
		const virtual = templates().flatMap((t) => generateVirtualItems(t, t.instance.date, today().add({ weeks: 2 })));
		return [...real, ...virtual].sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
	};
	const itemsByDate = () => Object.entries(Object.groupBy(items(), ({ date }) => date.toString()));

	const formatDate = (iso: string) => {
		const date = Temporal.PlainDate.from(iso);
		const weekday = date.toLocaleString("en-US", { weekday: "long" });
		const monthDay = date.toLocaleString("en-US", { month: "long", day: "numeric" });
		return { weekday, monthDay };
	};

	return (
		<div class="flex flex-col gap-2xl h-full">
			<For each={itemsByDate()} fallback={<Empty />}>
				{([dateKey, itemGroup]) => {
					const { weekday, monthDay } = formatDate(dateKey);

					return (
						<section class="flex flex-col gap-s">
							<header class="flex justify-between px-xs text-[var(--secondary)]">
								<h2 class="">{weekday}</h2>
								<h2 class="font-light text-xs">{monthDay}</h2>
							</header>
							<ul>
								<For each={itemGroup}>
									{(item) => <ListItem item={item} virtual={templateIds().has(item.id)} />}
								</For>
							</ul>
						</section>
					);
				}}
			</For>
		</div>
	);
};

export default Upcoming;
