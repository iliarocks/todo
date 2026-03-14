import { Component, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Temporal } from "temporal-polyfill";
import { db } from "../lib/db";
import { advanceDate, parseItem, parseTemplate, today, toDate } from "../lib/dates";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";
import { Item, RawTemplate, Template } from "../lib/types";

const VIRTUAL_PREFIX = "virtual-";
const UUID_LENGTH = 36;
const templateIdFromVirtualId = (id: string) =>
	id.slice(VIRTUAL_PREFIX.length, VIRTUAL_PREFIX.length + UUID_LENGTH);

const Upcoming: Component = () => {
	const navigate = useNavigate();
	const state = db.useQuery({
		items: {
			$: {
				where: {
					and: [
						{ date: { $gte: today().add({ days: 1 }).toString() } },
						{ date: { $lte: today().add({ days: 13 }).toString() } },
					],
				},
			},
			template: {},
		},
		templates: {
			instance: {},
		},
	});
	const realItems = () => (state().data?.items ?? []).map(parseItem);
	const virtualItems = () => generateVirtualItems(state().data?.templates ?? []);
	const items = () =>
		[...realItems(), ...virtualItems()].sort((a, b) =>
			Temporal.PlainDate.compare(a.date, b.date),
		);
	const itemsByDate = () =>
		Object.groupBy(items(), (item) =>
			item.date.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" }),
		);

	return (
		<Show when={!state().isLoading && !state().error}>
			<Show
				when={items().length > 0}
				fallback={<div class="flex h-full items-center justify-center"><p class="text-[var(--secondary)] text-sm">Enjoy the calm — nothing's coming.</p></div>}
			>
			<div class="flex flex-col gap-[54px]">
				<For each={Object.entries(itemsByDate())}>
					{([date, itemGroup]) => {
						const [weekday, monthDay] = date.split(", ");
						return (
							<section class="flex flex-col gap-xs">
								<header class="flex justify-between px-xs text-[var(--secondary)]">
									<h2 class="font-medium text-sm">{weekday}</h2>
									<h2 class="font-light text-xs">{monthDay}</h2>
								</header>
								<ul>
									<For each={itemGroup}>
										{(item) => {
											const isVirtual = item.id.startsWith(VIRTUAL_PREFIX);
											const onEdit = isVirtual
												? () => navigate(`/edit/template/${templateIdFromVirtualId(item.id)}`)
												: undefined;
											return item.type === "todo" ? (
												<TodoItem todo={item} virtual={isVirtual} onEdit={onEdit} />
											) : (
												<EventItem event={item} onEdit={onEdit} />
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

const virtualItem = (template: Template, date: Temporal.PlainDate): Item => ({
	id: `virtual-${template.id}-${date.toString()}`,
	type: template.type,
	text: template.text,
	date,
	start: template.start,
	end: template.end,
});

type RawTemplateWithInstance = RawTemplate & { instance?: { date: string } };

const generateVirtualItems = (rawTemplates: RawTemplateWithInstance[]): Item[] => {
	const start = today().add({ days: 1 });
	const end = today().add({ days: 13 });
	const items: Item[] = [];

	for (const raw of rawTemplates) {
		if (!raw.instance?.date) continue;
		const template = parseTemplate(raw);
		const instanceDate = toDate(raw.instance.date);
		const referenceDate =
			Temporal.PlainDate.compare(instanceDate, start) > 0 ? instanceDate : start;

		if (template.mode === "relative") {
			const date = advanceDate(referenceDate, template.interval, template.unit);
			items.push(virtualItem(template, date));
		}

		if (template.mode === "absolute") {
			const anchors = template.anchor.split(" ").map(Number);

			if (template.unit === "day") {
				let date = advanceDate(referenceDate, template.interval, "day");
				while (Temporal.PlainDate.compare(date, end) <= 0) {
					if (Temporal.PlainDate.compare(date, start) >= 0)
						items.push(virtualItem(template, date));
					date = advanceDate(date, template.interval, "day");
				}
			}

			if (template.unit === "week") {
					let week = referenceDate.subtract({ days: referenceDate.dayOfWeek - 1 });
				while (Temporal.PlainDate.compare(week, end) <= 0) {
					for (const day of anchors) {
						const date = week.add({ days: day });
						if (
							Temporal.PlainDate.compare(date, start) >= 0 &&
							Temporal.PlainDate.compare(date, end) <= 0 &&
							Temporal.PlainDate.compare(date, referenceDate) > 0
						) {
							items.push(virtualItem(template, date));
						}
					}
					week = advanceDate(week, template.interval, "week");
				}
			}

			if (template.unit === "month") {
				let month = referenceDate.with({ day: 1 });
				while (Temporal.PlainDate.compare(month, end) <= 0) {
					for (const day of anchors) {
						const date = month.with({ day: Math.min(day + 1, month.daysInMonth) });
						if (
							Temporal.PlainDate.compare(date, start) >= 0 &&
							Temporal.PlainDate.compare(date, end) <= 0 &&
							Temporal.PlainDate.compare(date, referenceDate) > 0
						) {
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
