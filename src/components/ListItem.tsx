import { Temporal } from "temporal-polyfill";
import { Component, Show } from "solid-js";
import { Item, Template } from "../library/types";
import Icon from "./Icon";
import { useNavigation } from "../library/navigation";
import { deleteItem } from "../library/db";

const format = (t: Temporal.PlainTime) =>
	t.round({ smallestUnit: "minute" }).toString().slice(0, 5);

const TodoItem: Component<{ todo: Item & { template?: Template }; virtual?: boolean }> = (
	props,
) => {
	const navigation = useNavigation();
	const todo = () => props.todo;
	const virtual = () => props.virtual ?? false;

	const onComplete = () => deleteItem(todo());

	return (
		<li
			onClick={() => navigation.push(`/notes/${todo().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--accent)]"
		>
			<p>{todo().text}</p>
			{virtual() ? (
				<Icon size={15}>repeat</Icon>
			) : (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onComplete();
					}}
					onPointerDown={(e) => e.stopPropagation()}
					class="flex text-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer"
				>
					<Icon size={15}>check_box_outline_blank</Icon>
				</button>
			)}
		</li>
	);
};

const EventItem: Component<{ event: Item; virtual?: boolean }> = (props) => {
	const navigation = useNavigation();
	const event = () => props.event;
	const virtual = () => props.virtual ?? false;

	return (
		<li
			onClick={() => navigation.push(`/notes/${event().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--accent)]"
		>
			<p>{event().text}</p>
			<Show when={event().start && event().end}>
				<div class="flex gap-s items-center">
					<p class="text-[var(--secondary)] text-xs font-light">
						{format(event().start!)} – {format(event().end!)}
					</p>
					<Show when={virtual()}>
						<Icon size={15}>repeat</Icon>
					</Show>
				</div>
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
