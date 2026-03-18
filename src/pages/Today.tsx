import { type Component, For, Show } from "solid-js";
import {
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
	DragOverlay,
	closestCenter,
	type DragEvent,
	createSortable,
	useDragDropContext,
} from "@thisbeyond/solid-dnd";
import { db } from "../lib/db";
import { Item, parseItemWithTemplate } from "../lib/types";
import { reorderItem } from "../lib/mutations";
import { today } from "../lib/dates";
import { ListItem } from "../components/ListItem";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

const Today: Component = () => {
	const state = db.useQuery({
		items: {
			$: { where: { date: { $lte: today().toString() } }, order: { order: "asc" } },
			template: {},
		},
	});

	const items = () => (state().data?.items ?? []).map(parseItemWithTemplate);
	const ids = () => items().map((i) => i.id);

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
								<For each={items()}>{(item) => <SortableItem item={item} />}</For>
							</SortableProvider>
						</ul>
						<DragOverlay>
							{(draggable) => {
								const item = items().find((i) => i.id === draggable?.id);
								return item ? <OverlayItem item={item} /> : null;
							}}
						</DragOverlay>
					</DragDropProvider>
				</Show>
			</Show>
		</div>
	);
};

const SortableItem = (props: { item: Item }) => {
	const sortable = createSortable(props.item.id);
	const [state] = useDragDropContext()!;
	return (
		<div
			use:sortable
			class="touch-none select-none"
			classList={{
				"transition-transform": !!state.active.draggable,
			}}
		>
			{sortable.isActiveDraggable ? (
				<div class="p-xs rounded-md bg-[var(--accent)]">&nbsp;</div>
			) : (
				<ListItem item={props.item} />
			)}
		</div>
	);
};

const OverlayItem: Component<{ item: Item }> = (props) => {
	return (
		<div class="rounded-md bg-[var(--accent)] shadow-2xs">
			<ListItem item={props.item} />
		</div>
	);
};

export default Today;
