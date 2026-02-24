import { type Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { format } from "date-fns";
import {
	closestCenter,
	createSortable,
	DragDropProvider,
	DragDropSensors,
	SortableProvider,
} from "@thisbeyond/solid-dnd";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

type Todo = InstaQLEntity<typeof schema, "todos", {}, undefined, true>;
type Event = InstaQLEntity<typeof schema, "events", {}, undefined, true>;

const Today: Component = () => {
	const state = db.useQuery({
		today: { $: { order: { order: "asc" } }, todo: {}, event: {} },
	});
	const items = () => state().data?.today ?? [];
	const ids = () => items().map((item) => item.id);

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
			<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
				<DragDropSensors />
				<SortableProvider ids={ids()}>
					<For each={items()}>
						{(item) => {
							const sortable = createSortable(item.id);
							return (
								<div use:sortable>
									{item.type === "todo" ? (
										<TodoItem todo={item.todo!} />
									) : (
										<EventItem event={item.event!} />
									)}
								</div>
							);
						}}
					</For>
				</SortableProvider>
			</DragDropProvider>
		</Show>
	);
};

const TodoItem: Component<{ todo: Todo }> = (props) => {
	return <div>{props.todo.text}</div>;
};

const EventItem: Component<{ event: Event }> = (props) => {
	return <div>{format(props.event.date, "H:m")} · {props.event.text}</div>;
};

export default Today;
