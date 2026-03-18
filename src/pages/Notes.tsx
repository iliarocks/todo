import { A, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { db } from "../lib/db";
import { Item, parseItemWithTemplate, parseTemplateWithInstance, Template } from "../lib/types";
import Button from "../components/Button";
import { marked } from "marked";


const Notes: Component = () => {
	const params = useParams<{ type: string; id: string }>();

	const isTemplate = () => params.type === "template";

	const itemQuery = db.useQuery({ items: { template: {}, $: { where: { id: params.id } } } });
	const templateQuery = db.useQuery({
		templates: { instance: {}, $: { where: { id: params.id } } },
	});

	const item = (): Item | Template | undefined => {
		if (isTemplate()) {
			const raw = templateQuery().data?.templates?.[0];
			if (!raw) return undefined;
			return parseTemplateWithInstance(raw);
		}
		const raw = itemQuery().data?.items?.[0];
		if (!raw) return undefined;
		return parseItemWithTemplate(raw);
	};

	return (
		<Show when={item()}>
			{(data) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between">
						<h1 class="text-[var(--secondary)]">{data().text}</h1>
						<Button><A href={`/edit/${data().type}/${params.type}/${params.id}`}>Edit</A></Button>
					</section>
					<Show when={data().notes}>{(notes) => <div innerHTML={marked.parse(notes()) as string} />}</Show>
				</div>
			)}
		</Show>
	);
};

export default Notes;
