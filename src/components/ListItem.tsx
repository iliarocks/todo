import { Temporal } from "temporal-polyfill";
import { Component, Show } from "solid-js";
import { db } from "../lib/db";
import { Item, Todo, Event, Template } from "../lib/types";
import { deleteItem } from "../lib/mutations";
import Icon from "./Icon";
import { useNavigateFromList } from "../lib/navigation";

const format = (t: Temporal.PlainTime) =>
	t.round({ smallestUnit: "minute" }).toString().slice(0, 5);

const TodoItem: Component<{ todo: Todo & { template?: Template }; virtual?: boolean }> = (
	props,
) => {
	const auth = db.useAuth();
	const navigateFromList = useNavigateFromList();
	const todo = () => props.todo;
	const virtual = () => props.virtual ?? false;

	const onComplete = () => deleteItem(todo(), auth().user!);

	return (
		<li
			onClick={() => navigateFromList(`/notes/${virtual() ? "template" : "instance"}/${todo().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--accent)]"
		>
			<p>{todo().text}</p>
			{virtual() ? (
				<Icon size={16}>repeat</Icon>
			) : (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onComplete();
					}}
					onPointerDown={(e) => e.stopPropagation()}
					class="flex text-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer"
				>
					<Icon size={16}>check_box_outline_blank</Icon>
				</button>
			)}
		</li>
	);
};

const EventItem: Component<{ event: Event; virtual?: boolean }> = (props) => {
	const navigateFromList = useNavigateFromList();
	const event = () => props.event;
	const virtual = () => props.virtual ?? false;

	return (
		<li
			onClick={() =>
				navigateFromList(`/notes/${virtual() ? "template" : "instance"}/${event().id}`)
			}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--accent)]"
		>
			<p>{event().text}</p>
			<Show when={event().start && event().end}>
				<p class="text-[var(--secondary)] text-xs font-light">
					{format(event().start!)} – {format(event().end!)}
				</p>
			</Show>
		</li>
	);
};

const ListItem: Component<{ item: Item & { template?: Template }; virtual?: boolean }> = (
	props,
) => {
	const virtual = () => props.virtual ?? false;

	if (props.item.type === "todo") {
		return <TodoItem todo={props.item} virtual={virtual()} />;
	}

	return <EventItem event={props.item} virtual={virtual()} />;
};

export default ListItem;
