import { id } from "@instantdb/solidjs";
import { Component } from "solid-js";
import { startOfDay } from "date-fns";
import { db } from "../lib/db";
import { Item } from "../lib/types";
import { nextOccurrenceDate } from "../lib/repeat";

const TodoItem: Component<{ todo: Item; virtual?: boolean }> = (props) => {
	const todo = () => props.todo;

	const onComplete = () => {
		const template = todo().template;
		if (template) {
			const nextDate = nextOccurrenceDate(template, todo().date);
			const nextId = id();
			db.transact([
				db.tx.items[nextId]
					.create({ type: "todo", text: todo().text, date: startOfDay(nextDate).toISOString() })
					.link({ template: template.id }),
				db.tx.log[id()].create({ type: "todo", text: todo().text, date: todo().date }),
				db.tx.items[todo().id].delete(),
			]);
		} else {
			db.transact([
				db.tx.log[id()].create({ type: "todo", text: todo().text, date: todo().date }),
				db.tx.items[todo().id].delete(),
			]);
		}
	};

	return (
		<li class={`flex items-center justify-between px-xs py-xxs ${props.virtual ? "" : "cursor-pointer active:bg-[var(--tertiary)]"}`}>
			<p>{todo().text}</p>
			{props.virtual ? (
				<span class="text-[var(--secondary)] text-xs">template</span>
			) : (
				<button
					onClick={onComplete}
					class="size-[9px] cursor-pointer border-[1px] border-[var(--secondary)] hover:bg-[var(--tertiary)] active:bg-[var(--secondary)]"
				/>
			)}
		</li>
	);
};

export default TodoItem;
