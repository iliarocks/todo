import { useParams } from "@solidjs/router";
import { type Component, createSignal, Show } from "solid-js";
import { useData } from "../context/data";
import { updateItem, updateTemplate } from "../library/db";
import { useNavigation } from "../library/navigation";
import { Input, Button, RichInput } from "../components/Input";
import Edit from "../components/Edit";

const Notes: Component = () => {
	const params = useParams<{ id: string }>();
	const data = useData();
	const navigation = useNavigation();
	const [editOpen, setEditOpen] = createSignal(false);

	const template = () => data.templates().find((t) => t.id === params.id);
	const item = () => data.items().find((i) => i.id === params.id);
	const entry = () => template() ?? item();
	const project = () => template()?.group ?? item()?.group;

	const saveText = (text: string) => {
		const t = template();
		const i = item();
		if (t) updateTemplate(t, { text });
		else if (i) updateItem(i, { text });
	};

	const saveNotes = (notes: string) => {
		const value = notes || undefined;
		const t = template();
		const i = item();
		if (t) updateTemplate(t, { notes: value });
		else if (i) updateItem(i, { notes: value });
	};

	return (
		<Show when={entry()}>
			{(entry) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between gap-m">
						<Input
							type="text"
							value={entry().text}
							onInput={(text) => text && saveText(text)}
							class="w-full"
						/>
						<div class="flex gap-s items-center shrink-0">
							<Show when={project()}>
								{(p) => (
									<Button onClick={() => navigation.push(`/project/${p().id}`)}>{p().name}</Button>
								)}
							</Show>
							<Button onClick={() => setEditOpen(true)}>Edit</Button>
						</div>
					</section>
					<RichInput value={entry().notes ?? ""} onInput={saveNotes} placeholder="Notes..." />
					<Show when={editOpen()}>
						<Edit item={item()} template={template()} onClose={() => setEditOpen(false)} />
					</Show>
				</div>
			)}
		</Show>
	);
};

export default Notes;
