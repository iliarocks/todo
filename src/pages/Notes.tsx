import { useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { db } from "../lib/db";
import { parseItem, parseTemplate } from "../lib/types";

const Notes: Component = () => {
	const params = useParams<{ type: string; id: string }>();

	const isTemplate = () => params.type === "template";

	const itemQuery = db.useQuery({ items: { template: {}, $: { where: { id: params.id } } } });
	const templateQuery = db.useQuery({
		templates: { instance: {}, $: { where: { id: params.id } } },
	});

	const item = () => {
		if (isTemplate()) {
			const raw = templateQuery().data?.templates?.[0];
			if (!raw) return undefined;
			return parseTemplate(raw);
		}
		const raw = itemQuery().data?.items?.[0];
		if (!raw) return undefined;
		return parseItem(raw);
	};

	return (
		<Show when={item()}>
			{(data) => (
				<div class="flex flex-col gap-s p-xs">
					<h1 class="text-[var(--secondary)]">{data().text}</h1>
					<Show when={data().notes}>
						{(notes) => <p class="whitespace-pre-wrap">{notes()}</p>}
					</Show>
				</div>
			)}
		</Show>
	);
};

export default Notes;
