import { Temporal } from "temporal-polyfill";
import { Component, For, Show, createEffect, on } from "solid-js";
import {
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
	DragOverlay,
	createSortable,
	closestCenter,
	type DragEvent,
} from "@thisbeyond/solid-dnd";
import { db } from "../lib/db";
import { parseItemWithTemplate, Item } from "../lib/types";
import { reconcileEvents, reorderItems } from "../lib/mutations";
import { today } from "../lib/dates";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";

const SortableItem: Component<{ item: Item; templateIds: Set<string> }> = (props) => {
	const sortable = createSortable(props.item.id);
	return (
		<div
			ref={sortable.ref}
			style={{ transform: sortable.transform ? `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)` : undefined }}
			class="touch-none"
			classList={{ "opacity-25": sortable.isActiveDraggable }}
			{...sortable.dragActivators}
		>
			{props.item.type === "todo" ? (
				<TodoItem todo={props.item} virtual={props.templateIds.has(props.item.id)} />
			) : (
				<EventItem event={props.item} virtual={props.templateIds.has(props.item.id)} />
			)}
		</div>
	);
};

const Today: Component = () => {
	const state = db.useQuery({
		items: { template: {} },
		templates: { instance: {} },
	});

	const t = () => today();

	const allItems = () => (state().data?.items ?? []).map(parseItemWithTemplate);
	const templateIds = () =>
		new Set((state().data?.templates ?? []).map((t) => t.id));

	createEffect(
		on(allItems, (items) => {
			const stale = items.filter(
				(i) => i.type === "event" && Temporal.PlainDate.compare(i.date, t()) < 0,
			);
			if (stale.length > 0) reconcileEvents(stale);
		}),
	);

	const todayItems = () =>
		allItems()
			.filter((i) => Temporal.PlainDate.compare(i.date, t()) === 0)
			.sort((a, b) => (a.order ?? "zzzzz").localeCompare(b.order ?? "zzzzz"));

	const ids = () => todayItems().map((i) => i.id);

	const onDragEnd = ({ draggable, droppable }: DragEvent) => {
		if (!draggable || !droppable || draggable.id === droppable.id) return;

		const currentIds = ids();
		const fromIndex = currentIds.indexOf(String(draggable.id));
		const toIndex = currentIds.indexOf(String(droppable.id));
		if (fromIndex === -1 || toIndex === -1) return;

		const reordered = [...currentIds];
		reordered.splice(fromIndex, 1);
		reordered.splice(toIndex, 0, currentIds[fromIndex]);
		reorderItems(reordered);
	};

	return (
		<div class="flex flex-col h-full justify-center">
		<Show when={!state().error}>
			<Show when={!state().isLoading}>
				<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
					<DragDropSensors />
					<SortableProvider ids={ids()}>
						<ul>
							<For each={todayItems()}>
								{(item) => (
									<SortableItem item={item} templateIds={templateIds()} />
								)}
							</For>
						</ul>
					</SortableProvider>
					<DragOverlay>
						{(draggable) => {
							const item = () =>
								draggable ? todayItems().find((i) => i.id === String(draggable.id)) : undefined;
							return (
								<Show when={item()}>
									{(i) => {
										const val = i();
										return val.type === "todo" ? (
											<TodoItem todo={val} />
										) : (
											<EventItem event={val} />
										);
									}}
								</Show>
							);
						}}
					</DragOverlay>
				</DragDropProvider>
			</Show>
		</Show>
		</div>
	);
};

export default Today;
