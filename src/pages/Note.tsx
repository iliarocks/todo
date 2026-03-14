import { type Component, createEffect, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { db } from "../lib/db";
import { parseItem } from "../lib/dates";
import TodoItem from "../components/TodoItem";
import EventItem from "../components/EventItem";

const Note: Component = () => {
	const params = useParams();
	const navigate = useNavigate();

	const query = db.useQuery({
		items: { $: { where: { id: params.id } } },
	});

	const item = () => {
		const r = query().data?.items?.[0];
		return r ? parseItem(r) : undefined;
	};

	createEffect(() => {
		if (!query().isLoading && !item()) navigate(-1);
	});

	return (
		<Show when={item()} fallback={<p>Loading...</p>}>
			{(i) => (
				<div class="flex flex-col gap-[24px]">
					<ul class="pointer-events-none">
						<Show
							when={i().type === "event"}
							fallback={<TodoItem todo={i()} />}
						>
							<EventItem event={i()} />
						</Show>
					</ul>
					<Show when={i().notes}>
						<p class="whitespace-pre-wrap text-sm">{i().notes}</p>
					</Show>
					<Show when={!i().notes}>
						<p class="text-sm text-[var(--secondary)]">No notes.</p>
					</Show>
				</div>
			)}
		</Show>
	);
};

export default Note;
