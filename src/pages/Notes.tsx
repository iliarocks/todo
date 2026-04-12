import { useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import Button from "../components/Button";
import { marked } from "marked";
import { useData } from "../context/data";
import { useNavigation } from "../library/navigation";

const Notes: Component = () => {
	const params = useParams<{ id: string }>();
	const navigation = useNavigation();
	const data = useData();
	const template = () => data.templates().find((t) => t.id === params.id);
	const item = () => data.items().find((i) => i.id === params.id);

	return (
		<Show when={template() || item()}>
			{(data) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between text-[var(--secondary)]">
						<h1>{data().text}</h1>
						<Button onClick={() => navigation.replace(`/edit/${params.id}`)}>Edit</Button>
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
