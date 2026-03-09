import { Component } from "solid-js";
import { db } from "../lib/db";
import { Item } from "../lib/types";
import { completeTodo } from "../lib/mutations";
import Icon from "./Icon";

const TodoItem: Component<{ todo: Item; virtual?: boolean }> = (props) => {
	const auth = db.useAuth();
	const todo = () => props.todo;

	const onComplete = () => completeTodo(todo(), auth().user!.id);

	return (
		<li class="flex items-center justify-between px-xs py-xxs cursor-pointer active:bg-[var(--tertiary)]">
			<p>{todo().text}</p>
			{props.virtual ? (
				<Icon size={18} class="text-[var(--secondary)]">restart_alt</Icon>
			) : (
				<button
					onClick={onComplete}
					class="size-[9px] cursor-pointer border-[1px] border-[var(--secondary)] active:bg-[var(--secondary)]"
				/>
			)}
		</li>
	);
};

export default TodoItem;
