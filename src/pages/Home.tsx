import {
	type Component,
	For,
	Show,
	createSignal,
	createEffect,
} from "solid-js";
import { db } from "../lib/db";
import { id, InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { endOfDay, endOfToday, format } from "date-fns";
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

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const Home: Component = () => {
	return (
		<div class="grid grid-cols-3 gap-m">
			<Today />
		</div>
	);
};

const Today: Component = () => {
	const state = db.useQuery({
		today: { $: { order: { order: "asc" } }, item: {} },
		items: { $: { where: { date: { $lt: endOfToday() } } } },
	});
	const allItems = () => state().data?.items ?? [];
	const items = () => state().data?.today ?? [];
	const ids = () => items().map((item) => item.id);

	createEffect(() => {
		const linkedItemIds = new Set(items().map((t) => t.item?.id));
		const missing = allItems().filter((item) => !linkedItemIds.has(item.id));
		if (missing.length === 0) return;

		const currentCount = items().length;
		db.transact(
			missing.flatMap((item, i) => {
				const todayId = id();
				return [
					db.tx.today[todayId].update({
						order: currentCount + i,
					}),
					db.tx.today[todayId].link({ item: item.id }),
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
			<div>
				<DragDropProvider
					onDragEnd={onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<SortableProvider ids={ids()}>
						<For each={items()}>
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

const TodoItem: Component<{ todo: Item }> = (props) => {
	const onDelete = () => {
		const item = props.todo;
		db.transact([
			db.tx.log[id()].create({
				type: "todo",
				text: item.text,
				date: item.date,
			}),
			db.tx.items[item.id].delete(),
		]);
	};

	return (
		<div class="flex gap-l">
			<p>{props.todo.text}</p>
			<button onClick={onDelete}>complete</button>
		</div>
	);
};

const EventItem: Component<{ event: Item }> = (props) => {
	return (
		<div class="flex gap-l">
			<p>
				{format(props.event.date, "HH:mm")} · {props.event.text}
			</p>
		</div>
	);
};

export default Home;
