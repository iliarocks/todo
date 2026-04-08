import { A, useLocation, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { Item, Template } from "../library/types";
import Button from "../components/Button";
import { marked } from "marked";
import { useData } from "../context/data";

const Notes: Component = () => {
	const params = useParams<{ type: string; id: string }>();
	const location = useLocation();
	const isTemplate = () => params.type === "template";
	const data = useData();

	const item = (): Item | Template | undefined => {
		if (isTemplate()) return data.templates().find((t) => t.id === params.id);
		return data.items().find((i) => i.id === params.id);
	};

	return (
		<Show when={item()}>
			{(data) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between text-[var(--secondary)]">
						<h1>{data().text}</h1>
						<Button>
							<A
								href={`/edit/${params.type}/${params.id}`}
								state={{ origin: (location.state as any)?.origin }}
							>
								Edit
							</A>
						</Button>
					</section>
					<Show when={data().notes}>
						{(notes) => <div innerHTML={marked.parse(notes()) as string} />}
					</Show>
				</div>
			)}
		</Show>
	);
};

export default Notes;
