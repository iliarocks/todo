import { addDays, endOfToday, format } from "date-fns";
import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";

const Upcoming: Component = () => {
	const state = db.useQuery({
		items: {
			$: {
				where: {
					and: [
						{ date: { $gte: endOfToday() } },
						{ date: { $lte: addDays(endOfToday(), 13) } },
					],
				},
				order: {
					date: "asc",
				},
			},
		},
	});
	const items = () => state().data?.items ?? [];
	const itemsByDate = () =>
		Object.groupBy(items(), (item) => format(item.date, "EEEE, MMMM d"));

	return (
		<Show when={!state().isLoading && !state().error}>
			<main class="grid h-full w-full place-items-center p-s">
				<div class="flex flex-col gap-m">
					<For each={Object.entries(itemsByDate())}>
						{([date, itemGroup]) => {
							const sorted = () =>
								itemGroup!.toSorted((a, b) => a.type.localeCompare(b.type));
							const [weekday, monthDay] = date.split(", ");
							return (
								<section class="flex flex-col gap-xs w-[500px]">
									<div class="flex justify-between items-center">
										<h2 class="text-lg">{weekday}</h2>
										<h3 class="text-[var(--secondary)]">{monthDay}</h3>
									</div>
									<ul>
										<For each={sorted()}>
											{(item) =>
												item.type === "todo" ? (
													<TodoItem todo={item} />
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
			</main>
		</Show>
	);
};

export default Upcoming;
