import { Component, For, Show } from "solid-js";
import { db } from "../lib/db";
import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";

type Todo = InstaQLEntity<typeof schema, "todos", {}, undefined, true>;

const Today: Component = () => {
	const state = db.useQuery({ todos: {} });

	return (
		<Show when={!state().isLoading && !state().error}>
			<For each={state().data?.todos}>
				{(todo) => <h1>{todo.text}</h1>}
			</For>
		</Show>
	);
};

export default Today;
