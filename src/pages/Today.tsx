import { type Component, For, Show, createEffect } from "solid-js";
import { db } from "../lib/db";
import { id } from "@instantdb/solidjs";
import { endOfToday, startOfDay, startOfToday } from "date-fns";
import {
	closestCenter,
	createSortable,
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";
import { nextOccurrenceDate } from "../lib/repeat";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

const Today: Component = () => {
	const auth = db.useAuth();
	const state = db.useQuery({
		today: { $: { order: { order: "asc" } }, item: { template: {} } },
		items: { $: { where: { date: { $lt: endOfToday() } } } },
	});
	const items = () => state().data?.items ?? [];
	const today = () => state().data?.today ?? [];
	const ids = () => today().map((item) => item.id);

	// Add any unlinked past items to today
	createEffect(() => {
		const userId = auth().user?.id;
		if (!userId) return;

		const linkedIds = new Set(today().map((t) => t.item?.id));
		const missing = items().filter((item) => !linkedIds.has(item.id));
		if (missing.length === 0) return;

		const currentLength = today().length;
		db.transact(
			missing.map((item, i) => {
				const todayId = id();
				return db.tx.today[todayId]
					.update({ order: currentLength + i })
					.link({ item: item.id, user: userId });
			}),
		);
	});

	// Reconcile past events: delete them, and advance repeating ones to next instance
	createEffect(() => {
		const userId = auth().user?.id;
		if (!userId) return;

		const pastEvents = today().filter(
			(t) => t.item?.type === "event" && t.item.date < startOfToday(),
		);
		if (pastEvents.length === 0) return;

		db.transact(
			pastEvents.flatMap((t) => {
				const item = t.item!;
				const deleteOps = [
					db.tx.today[t.id].delete(),
					db.tx.items[item.id].delete(),
				];
				if (!item.template) return deleteOps;

				const nextDate = nextOccurrenceDate(item.template, item.date);
				const nextId = id();
				return [
					db.tx.items[nextId]
						.create({
							type: "event",
							text: item.text,
							date: startOfDay(nextDate).toISOString(),
							startTime: item.startTime!,
							endTime: item.endTime!,
						})
						.link({ template: item.template.id, user: userId }),
					...deleteOps,
				];
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
