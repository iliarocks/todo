import { Temporal } from "temporal-polyfill";
import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import { parseItemWithTemplate, parseTemplateWithInstance } from "../lib/types";
import { generateVirtualItems } from "../lib/repeat";
import { today } from "../lib/dates";
import ListItem from "../components/ListItem";

const Upcoming: Component = () => {
	const state = db.useQuery({
		items: {
			$: { where: { date: { $gt: today().toString() } } },
			template: {},
		},
		templates: { instance: {} },
	});
	const templates = () =>
		(state().data?.templates ?? []).flatMap((template) => {
			const parsed = parseTemplateWithInstance(template);
			return parsed ? [parsed] : [];
		});
	const templateIds = () => new Set(templates().map((template) => template.id));
	const items = () => {
		const real = (state().data?.items ?? []).map(parseItemWithTemplate);
		const virtual = templates().flatMap((template) => {
			return generateVirtualItems(template, template.instance.date, today().add({ weeks: 2 }));
		});

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
		<Show when={!state().error}>
			<Show when={!state().isLoading}>
				<div class="flex flex-col gap-2xl">
					<For each={itemsByDate()}>
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
			</Show>
		</Show>
	);
};

export default Upcoming;
