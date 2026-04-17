import { useParams } from "@solidjs/router";
import { type Component, createSignal, Show } from "solid-js";
import { useData } from "../context/data";
import { updateItem, updateTemplate } from "../library/db";
import { InlineInput } from "../components/Form";
import RichText from "../components/RichText";
import Edit from "../components/Edit";
import Button from "../components/Button";

const Notes: Component = () => {
	const params = useParams<{ id: string }>();
	const data = useData();
	const [editOpen, setEditOpen] = createSignal(false);

	const template = () => data.templates().find((t) => t.id === params.id);
	const item = () => data.items().find((i) => i.id === params.id);
	const entry = () => template() ?? item();

	const saveText = (text: string) => {
		const t = template();
		const i = item();
		if (t) updateTemplate(t, { text });
		else if (i) updateItem(i, { text });
	};

	const saveNotes = (notes: string | undefined) => {
		const t = template();
		const i = item();
		if (t) updateTemplate(t, { notes });
		else if (i) updateItem(i, { notes });
	};

	return (
		<Show when={entry()}>
			{(data) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between text-[var(--secondary)]">
						<InlineInput
							type="text"
							value={data().text}
							onInput={(text) => text && saveText(text)}
						/>
						<Button onClick={() => setEditOpen(true)}>Edit</Button>
					</section>
					<RichText
						value={data().notes}
						onInput={saveNotes}
					/>
					<Edit
						item={item()}
						template={template()}
						open={editOpen()}
						onClose={() => setEditOpen(false)}
					/>
				</div>
			)}
		</Show>
	);
};

export default Notes;
