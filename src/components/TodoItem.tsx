import { id, InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import schema from "../instant.schema";
import { db } from "../lib/db";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

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

export default TodoItem;
