import { type Component, For, Show, createEffect, on } from "solid-js";
import {
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
	DragOverlay,
	closestCenter,
	type DragEvent,
} from "@thisbeyond/solid-dnd";
import { db } from "../lib/db";
import { parseItemWithTemplate } from "../lib/types";
import { reorderItem, reconcileEvents } from "../lib/mutations";
import { today } from "../lib/dates";
import { ListItem, Sortable } from "../components/ListItem";

const Today: Component = () => {
	const auth = db.useAuth();
	const state = db.useQuery({
		items: {
			$: { where: { date: { $lte: today().toString() } }, order: { order: "asc" } },
			template: {},
		},
	});

	const items = () => (state().data?.items ?? []).map(parseItemWithTemplate);
	const ids = () => items().map((i) => i.id);

	createEffect(
		on(items, (is) => {
			const user = auth().user;

			if (user) {
				reconcileEvents(
					is.filter((i) => i.type === "event"),
					user,
				);
			}
		}),
	);

	const onDragEnd = ({ draggable, droppable }: DragEvent) => {
		if (!draggable || !droppable || draggable.id === droppable.id) return;

		const current = items();
		const from = current.findIndex((i) => i.id === draggable.id);
		const to = current.findIndex((i) => i.id === droppable.id);

		const before = (from < to ? current[to] : current[to - 1])?.order;
		const after = (from > to ? current[to] : current[to + 1])?.order;

		reorderItem(String(draggable.id), before, after);
	};

	return (
		<div class="flex flex-col h-full justify-center">
			<Show when={!state().error}>
				<Show when={!state().isLoading}>
					<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
						<DragDropSensors />
						<ul>
							<SortableProvider ids={ids()}>
								<For each={items()}>{(item) => <Sortable item={item} />}</For>
							</SortableProvider>
						</ul>
						<DragOverlay>
							{(draggable) => {
								const item = items().find((i) => i.id === draggable?.id);
								return item ? <ListItem item={item} /> : null;
							}}
						</DragOverlay>
					</DragDropProvider>
				</Show>
			</Show>
		</div>
	);
};

export default Today;
