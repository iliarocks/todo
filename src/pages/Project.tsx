import { useParams } from "@solidjs/router";
import { type Component, For, Show } from "solid-js";
import { useData } from "../context/data";
import { deleteGroup, updateGroup } from "../library/db";
import { useNavigation } from "../library/navigation";
import { Input, RichInput, Button } from "../components/Input";
import ListItem from "../components/ListItem";
import { Item } from "../library/types";
import { today } from "../library/date";

const Project: Component = () => {
	const params = useParams<{ id: string }>();
	const data = useData();
	const navigation = useNavigation();

	const project = () => data.groups().find((p) => p.id === params.id);

	const entries = () => {
		const p = project();
		if (!p) return [];
		return [
			...p.items.map((item) => ({ item: item as Item, virtual: false })),
			...p.templates.map((t) => ({
				item: {
					id: t.id,
					type: t.type,
					text: t.text,
					notes: t.notes,
					date: today(),
					start: t.start,
					end: t.end,
				} as Item,
				virtual: true,
			})),
		];
	};

	const saveName = (name: string) => {
		const p = project();
		if (p && name) updateGroup(p, { name });
	};

	const saveNotes = (notes: string) => {
		const p = project();
		if (p) updateGroup(p, { notes: notes || null });
	};

	const toggleActive = () => {
		const p = project();
		if (p) updateGroup(p, { active: !p.active });
	};

	const handleDelete = () => {
		const p = project();
		if (p) {
			deleteGroup(p);
			navigation.back();
		}
	};

	return (
		<Show when={project()}>
			{(p) => (
				<div class="flex flex-col gap-m">
					<section class="flex justify-between items-center">
						<Input type="text" value={p().name} onInput={saveName} class="text-lg font-medium" />
						<div class="flex gap-s items-center shrink-0 text-[var(--secondary)]">
							<Button onClick={toggleActive}>{p().active ? "Archive" : "Activate"}</Button>
							<Button onClick={handleDelete}>Delete</Button>
						</div>
					</section>
					<RichInput placeholder="Notes" value={p().notes ?? ""} onInput={saveNotes} />
					<Show when={entries().length > 0}>
						<ul class="flex flex-col">
							<For each={entries()}>
								{(entry) => <ListItem item={entry.item} virtual={entry.virtual} />}
							</For>
						</ul>
					</Show>
				</div>
			)}
		</Show>
	);
};

export default Project;
