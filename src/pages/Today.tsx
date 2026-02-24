import { type Component, For, Show, from } from "solid-js";
import { db } from "../lib/db";
import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
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

const Today: Component = () => {
	const state = db.useQuery({ todos: { $: { order: { order: "asc" } } } });
	const todos = () => state().data?.todos ?? [];
	const ids = () => todos().map((todo) => todo.id);

	const onDragEnd = ({ draggable, droppable }: any) => {
		if (draggable && droppable) {
			const fromIndex = ids().indexOf(draggable.id);
			const toIndex = ids().indexOf(droppable.id);

			if (fromIndex !== toIndex) {
				const reordered = ids().slice();
				reordered.splice(toIndex, 0, ...reordered.splice(fromIndex, 1));

				db.transact(reordered.map((id, order) => db.tx.todos[id].update({ order })));
			}
		}
	};

	return (
		<Show when={!state().isLoading && !state().error}>
			<DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
				<DragDropSensors />
				<SortableProvider ids={ids()}>
					<For each={todos()}>
						{(todo) => {
							const sortable = createSortable(todo.id);
							return <div use:sortable>{todo.text}</div>;
						}}
					</For>
				</SortableProvider>
			</DragDropProvider>
		</Show>
	);
};

export default Today;
