import { type Component, For } from "solid-js";
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
import { Item, Template } from "../library/types";
import ListItem from "../components/ListItem";
import Empty from "../components/Empty";
import { useData } from "../context/data";
import { compareDate, today } from "../library/date";
import { updateItem } from "../library/db";
import { between } from "../library/order";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

const Today: Component = () => {
	const data = useData();
	const items = () => data.items().filter((item) => compareDate(item.date, today()) === 0);
	const ids = () => items().map((i) => i.id);

	const onDragEnd = ({ draggable, droppable }: DragEvent) => {
		if (!draggable || !droppable || draggable.id === droppable.id) return;

		const current = items();
		const from = current.findIndex((i) => i.id === draggable.id);
		const to = current.findIndex((i) => i.id === droppable.id);

		const before = (from < to ? current[to] : current[to - 1])?.order;
		const after = (from > to ? current[to] : current[to + 1])?.order;

		updateItem(current[from], { order: between(before, after) });
	};

	return (
		<div class="flex flex-col h-full justify-center">
			<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
				<DragDropSensors />
				<ul>
					<SortableProvider ids={ids()}>
						<For each={items()} fallback={<Empty />}>
							{(item) => <SortableItem item={item} />}
						</For>
					</SortableProvider>
				</ul>
				<DragOverlay>
					{(draggable) => {
						const item = items().find((i) => i.id === draggable?.id);
						return item ? <OverlayItem item={item} /> : null;
					}}
				</DragOverlay>
			</DragDropProvider>
		</div>
	);
};

const SortableItem = (props: { item: Item & { template?: Template } }) => {
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

const OverlayItem: Component<{ item: Item & { template?: Template } }> = (props) => {
	return (
		<div class="rounded-md bg-[var(--accent)] shadow-2xs">
			<ListItem item={props.item} />
		</div>
	);
};

export default Today;
