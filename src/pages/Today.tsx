import { type Component, For, Show, createEffect } from "solid-js";
import { db } from "../lib/db";
import { id } from "@instantdb/solidjs";
import { endOfToday } from "date-fns";
import {
	closestCenter,
	createSortable,
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

const Today: Component = () => {
	const state = db.useQuery({
		today: { $: { order: { order: "asc" } }, item: {} },
		items: { $: { where: { date: { $lt: endOfToday() } } } },
	});
	const items = () => state().data?.items ?? [];
	const today = () => state().data?.today ?? [];
	const ids = () => today().map((item) => item.id);

	createEffect(() => {
		const linkedIds = new Set(today().map((t) => t.item?.id));
		const missing = items().filter((item) => !linkedIds.has(item.id));
		if (missing.length === 0) return;

		const currentLength = today().length;
		db.transact(
			missing.map((item, i) => {
				const todayId = id();
				return db.tx.today[todayId]
					.update({
						order: currentLength + i,
					})
					.link({ item: item.id });
			}),
		);
	});

	const onDragEnd = ({ draggable, droppable }: any) => {
		if (draggable && droppable) {
			const fromIndex = ids().indexOf(draggable.id);
			const toIndex = ids().indexOf(droppable.id);

			if (fromIndex !== toIndex) {
				const reordered = ids().slice();
				reordered.splice(toIndex, 0, ...reordered.splice(fromIndex, 1));

				db.transact(
					reordered.map((id, order) => db.tx.today[id].update({ order })),
				);
			}
		}
	};

	return (
		<Show when={!state().isLoading && !state().error}>
			<div class="w-[500px]">
				<DragDropProvider
					onDragEnd={onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<SortableProvider ids={ids()}>
						<For each={today()}>
							{(item) => {
								const sortable = createSortable(item.id);
								const realItem = item.item;
								if (!realItem) return;
								return (
									<div use:sortable>
										{realItem.type === "todo" ? (
											<TodoItem todo={realItem} />
										) : (
											<EventItem event={realItem} />
										)}
									</div>
								);
							}}
						</For>
					</SortableProvider>
				</DragDropProvider>
				</div>
		</Show>
	);
};

export default Today;
