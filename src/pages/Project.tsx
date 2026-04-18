import { useParams } from "@solidjs/router";
import { type Component, createSignal, For, Show } from "solid-js";
import { useData } from "../context/data";
import { deleteProject, updateProject } from "../library/db";
import { useNavigation } from "../library/navigation";
import { Input, RichText } from "../components/Form";
import ListItem from "../components/ListItem";
import Button from "../components/Button";

const Project: Component = () => {
	const params = useParams<{ id: string }>();
	const data = useData();
	const navigation = useNavigation();

	const project = () => data.projects().find((p) => p.id === params.id);

	const entries = () => {
		const p = project();
		if (!p) return [];
		return [
			...p.items.map((item) => ({ item, virtual: false })),
			...p.templates.map((t) => ({ item: { ...t.instance, text: t.text }, virtual: true })),
		].sort((a, b) => a.item.order.localeCompare(b.item.order));
	};

	const saveName = (name: string) => {
		const p = project();
		if (p) updateProject(p, { name });
	};

	const saveNotes = (notes: string | undefined) => {
		const p = project();
		if (p) updateProject(p, { notes: notes ?? null });
	};

	const toggleActive = () => {
		const p = project();
		if (p) updateProject(p, { active: !p.active });
	};

	const handleDelete = () => {
		const p = project();
		if (p) {
			deleteProject(p);
			navigation.back();
		}
	};

	return (
		<Show when={project()}>
			{(p) => (
				<div class="flex flex-col gap-m">
					<section class="flex justify-between items-center text-[var(--secondary)]">
						<Input
							type="text"
							value={p().name}
							onInput={(text) => text && saveName(text)}
						/>
						<div class="flex gap-s items-center shrink-0">
							<Button onClick={toggleActive}>
								{p().active ? "Complete" : "Activate"}
							</Button>
							<Button onClick={handleDelete}>Delete</Button>
						</div>
					</section>
					<RichText
						placeholder="Notes"
						value={p().notes}
						onInput={saveNotes}
					/>
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
