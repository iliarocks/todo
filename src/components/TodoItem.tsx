import { id, InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import schema from "../instant.schema";
import { db } from "../lib/db";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const TodoItem: Component<{ todo: Item }> = (props) => {
	const todo = () => props.todo;

	const onDelete = () => {
		db.transact([
			db.tx.log[id()].create({
				type: "todo",
				text: todo().text,
				date: todo().date,
			}),
			db.tx.items[todo().id].delete(),
		]);
	};

	return (
		<li class="flex items-center justify-between px-xs py-xxs cursor-pointer">
			<p>{todo().text}</p>
			<button
				onClick={onDelete}
				class="size-[9px] cursor-pointer border-[1px] border-[var(--secondary)] hover:bg-[var(--tertiary)] active:bg-[var(--secondary)]"
			/>
		</li>
	);
};

export default TodoItem;
