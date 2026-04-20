import { Component, createMemo, For } from "solid-js";
import { useData } from "../context/data";
import { Temporal } from "temporal-polyfill";
import Empty from "../components/Empty";
import ListItem from "../components/ListItem";
import { generateVirtualItems } from "../library/repeat";
import { TransitionGroup } from "solid-transition-group";
import { listTransition } from "../library/transitions";

const Upcoming: Component = () => {
	const data = useData();
	const templates = () => data.templates();
	const templateIds = () => new Set(templates().map((t) => t.id));
	const virtualItems = createMemo(
		() =>
			templates().flatMap((t) =>
				generateVirtualItems(t, t.instance.date, Temporal.Now.plainDateISO().add({ months: 1 })),
			),
		[],
		{ equals: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
	);
	const items = () => {
		const real = data
			.items()
			.filter((i) => Temporal.PlainDate.compare(i.date, Temporal.Now.plainDateISO()) > 0);
		return [...real, ...virtualItems()].sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
	};

	const dates = () => [...new Set(items().map((i) => i.date.toString()))].sort();

	const formatDate = (iso: string) => {
		const date = Temporal.PlainDate.from(iso);
		const weekday = date.toLocaleString("en-US", { weekday: "long" });
		const monthDay = date.toLocaleString("en-US", { month: "long", day: "numeric" });
		return { weekday, monthDay };
	};

	return (
		<div class="flex flex-col gap-2xl">
			<For each={dates()} fallback={<Empty />}>
				{(dateISO) => {
					const itemGroup = () => items().filter((i) => i.date.toString() === dateISO);
					const { weekday, monthDay } = formatDate(dateISO);

					return (
						<section class="flex flex-col gap-s">
							<header class="flex justify-between px-xs text-[var(--secondary)]">
								<h2>{weekday}</h2>
								<h2 class="text-xs">{monthDay}</h2>
							</header>
							<ul>
								<TransitionGroup {...listTransition}>
									<For each={itemGroup()}>
										{(item) => <ListItem item={item} virtual={templateIds().has(item.id)} />}
									</For>
								</TransitionGroup>
							</ul>
						</section>
					);
				}}
			</For>
		</div>
	);
};

export default Upcoming;
