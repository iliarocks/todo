import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { db } from "../lib/db";
import { Item } from "../lib/types";
import { completeTodo } from "../lib/mutations";
import Icon from "./Icon";

const TodoItem: Component<{ todo: Item; virtual?: boolean }> = (props) => {
	const auth = db.useAuth();
	const navigate = useNavigate();
	const todo = () => props.todo;

	const onComplete = () => completeTodo(todo(), auth().user!.id);

	return (
		<li
			onClick={() => !props.virtual && navigate(`/edit/${todo().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
		>
			<p>{todo().text}</p>
			{props.virtual ? (
				<Icon size={16} class="text-[var(--secondary)]">repeat</Icon>
			) : (
				<button
					onClick={(e) => { e.stopPropagation(); onComplete(); }}
					class="flex text-[var(--secondary)] hover:text-[var(--accent)] cursor-pointer"
				>
					<Icon size={16}>check_box_outline_blank</Icon>
				</button>
			)}
		</li>
	);
};

export default TodoItem;
