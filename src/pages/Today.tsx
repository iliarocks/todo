import { type Component, For, Show, createEffect } from "solid-js";
import { db } from "../lib/db";
import { id } from "@instantdb/solidjs";
import {
	closestCenter,
	createSortable,
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";
import { nextDate } from "../lib/repeat";
import { parseItem, parseTemplate, today } from "../lib/dates";
import { Temporal } from "temporal-polyfill";

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
		items: {
			$: {
				where: {
					today: { $isNull: true },
					date: { $lt: today().add({ days: 1 }).toString() },
				},
			},
		},
	});
	const entries = () => state().data?.today ?? [];
	const ids = () => entries().map((entry) => entry.id);
	const missing = () => state().data?.items ?? [];

	createEffect(() => {
		const user = auth().user;
		if (!user) return;

		const transactions = missing().map((item, i) => {
			return db.tx.today[id()]
				.update({ order: entries().length + i })
				.link({ item: item.id, user: user.id });
		});

		if (transactions.length !== 0) db.transact(transactions);
	});

	// Reconcile past events: delete them, and advance repeating ones to next instance
	createEffect(() => {
		const user = auth().user;
		if (!user) return;

		const transactions = entries().flatMap((entry) => {
			if (!entry.item) return [];

			const item = parseItem(entry.item);
			if (item.type !== "event" || Temporal.PlainDate.compare(item.date, today()) >= 0) return [];

			const deleteOp = db.tx.items[item.id].delete();
			if (!entry.item.template) return [deleteOp];

			const template = parseTemplate(entry.item.template);
			const date = nextDate(item.date, template);
			const nextId = id();
			return [
				deleteOp,
				db.tx.items[nextId]
					.create({
						type: "event",
						text: item.text,
						date: date.toString(),
						start: item.start?.toString(),
						end: item.end?.toString(),
					})
					.link({ template: entry.item.template.id, user: user.id }),
			];
		});

		if (transactions.length !== 0) db.transact(transactions);
	});

	const onDragEnd = ({ draggable, droppable }: any) => {
		if (draggable && droppable) {
			const fromIndex = ids().indexOf(draggable.id);
			const toIndex = ids().indexOf(droppable.id);

			if (fromIndex !== toIndex) {
				const reordered = ids().slice();
				reordered.splice(toIndex, 0, ...reordered.splice(fromIndex, 1));

				db.transact(reordered.map((id, order) => db.tx.today[id].update({ order })));
			}
		}
	};

	return (
		<Show when={!state().isLoading && !state().error}>
			<Show
				when={entries().length > 0}
				fallback={<div class="flex h-full items-center justify-center"><p class="text-[var(--secondary)] text-sm">What needs to get done?</p></div>}
			>
				<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
					<DragDropSensors />
					<SortableProvider ids={ids()}>
						<For each={entries()}>
							{(entry) => {
								const sortable = createSortable(entry.id);
								return (
									<Show when={entry.item}>
										{(rawItem) => {
											const item = parseItem(rawItem());
											return (
												<div use:sortable class="touch-none select-none">
													{item.type === "todo" ? (
														<TodoItem todo={item} />
													) : (
														<EventItem event={item} />
													)}
												</div>
											);
										}}
									</Show>
								);
							}}
						</For>
					</SortableProvider>
				</DragDropProvider>
			</Show>
		</Show>
	);
};

export default Today;
