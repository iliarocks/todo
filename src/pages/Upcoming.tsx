import { Temporal } from "temporal-polyfill";
import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import { parseItem, parseTemplate } from "../lib/types";
import TodoItem from "../components/TodoItem";
import { generateVirtualItems } from "../lib/repeat";
import { today } from "../lib/dates";
import EventItem from "../components/EventItem";

const Upcoming: Component = () => {
	const state = db.useQuery({
		items: { template: {} },
		templates: { instance: {} },
	});
	const templates = () => (state().data?.templates ?? []).map(parseTemplate);
	const until = () => today().add({ weeks: 2 });
	const virtual = () =>
		templates().flatMap((tmpl) => generateVirtualItems(tmpl, tmpl.instance?.date ?? t(), until()));
	const t = () => today();
	const real = () =>
		(state().data?.items ?? []).map(parseItem).filter((i) => Temporal.PlainDate.compare(i.date, t()) > 0);
	const templateIds = () => new Set(templates().map((t) => t.id));
	const items = () =>
		[...real(), ...virtual()].sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
	const itemsByDate = () => Object.groupBy(items(), ({ date }) => date.toString());

	const formatDate = (iso: string) => {
		const date = Temporal.PlainDate.from(iso);
		const weekday = date.toLocaleString("en-US", { weekday: "long" });
		const monthDay = date.toLocaleString("en-US", { month: "long", day: "numeric" });
		return { weekday, monthDay };
	};

	return (
		<Show when={!state().error}>
			<Show when={!state().isLoading}>
				<div class="flex flex-col gap-[54px]">
					<For each={Object.entries(itemsByDate())}>
						{([dateKey, itemGroup]) => {
							const { weekday, monthDay } = formatDate(dateKey);

							return (
								<section class="flex flex-col gap-xs">
									<header class="flex justify-between px-xs text-[var(--secondary)]">
										<h2 class="font-medium text-sm">{weekday}</h2>
										<h2 class="font-light text-xs">{monthDay}</h2>
									</header>
									<ul>
										<For each={itemGroup}>
											{(item) => {
												return item.type === "todo" ? (
													<TodoItem todo={item} virtual={templateIds().has(item.id)} />
												) : (
													<EventItem event={item} virtual={templateIds().has(item.id)} />
												);
											}}
										</For>
									</ul>
								</section>
							);
						}}
					</For>
				</div>
			</Show>
		</Show>
	);
};

export default Upcoming;
