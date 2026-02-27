import { addDays, endOfToday, format } from "date-fns";
import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";

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
			},
		},
	});
	const items = () => state().data?.items ?? [];
	const itemsByDate = () =>
		Object.groupBy(items(), (item) => format(item.date, "EEEE, MMMM d"));

	return (
		<Show when={!state().isLoading && !state().error}>
			<main class="flex flex-col gap-m">
				<For each={Object.entries(itemsByDate())}>
					{([date, itemGroup]) => {
						return (
							<section class="flex flex-col gap-s">
								<h2>{date}</h2>
								<ul>
									<For each={itemGroup}>{(item) => <li>{item.text}</li>}</For>
								</ul>
							</section>
						);
					}}
				</For>
			</main>
		</Show>
	);
};

export default Upcoming;
