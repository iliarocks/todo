import { Temporal } from "temporal-polyfill";
import { Component, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { db } from "../lib/db";
import { Item, Todo, Event } from "../lib/types";
import { completeTodo } from "../lib/mutations";
import Icon from "./Icon";

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			sortable: true;
		}
	}
}

const format = (t: Temporal.PlainTime) =>
	t.round({ smallestUnit: "minute" }).toString().slice(0, 5);

const TodoItem: Component<{ todo: Todo; virtual?: boolean }> = (props) => {
	const auth = db.useAuth();
	const navigate = useNavigate();
	const todo = () => props.todo;
	const virtual = () => props.virtual ?? false;

	const onComplete = () => completeTodo(todo(), auth().user!);

	return (
		<li
			onClick={() => navigate(`/notes/${virtual() ? "template" : "instance"}/${todo().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
		>
			<p>{todo().text}</p>
			{virtual() ? (
				<Icon size={16}>repeat</Icon>
			) : (
				<button
					onClick={(e) => { e.stopPropagation(); onComplete(); }}
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
	const navigate = useNavigate();
	const event = () => props.event;
	const virtual = () => props.virtual ?? false;

	return (
		<li
			onClick={() => navigate(`/notes/${virtual() ? "template" : "instance"}/${event().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
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

export const ListItem: Component<{ item: Item; virtual?: boolean }> = (props) => {
	const virtual = () => props.virtual ?? false;

	if (props.item.type === "todo") {
		return <TodoItem todo={props.item} virtual={virtual()} />;
	}

	return <EventItem event={props.item} virtual={virtual()} />;
};

export const Sortable = (props: { item: Item }) => {
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
