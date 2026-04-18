import { type Component, For, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import { createProject, createVision, updateVision, saveReminder } from "../library/db";
import { useNavigation } from "../library/navigation";
import { DateInput, RichText } from "../components/Form";
import { between } from "../library/order";
import IconButton from "../components/IconButton";

const Vision: Component = () => {
	const user = useUser();
	const data = useData();
	const navigation = useNavigation();

	const projects = () => data.projects().filter((p) => p.active);
	const groups = () => data.projects().filter((p) => !p.active);

	const saveText = (text: string | undefined) => {
		const vision = data.vision();
		if (vision) {
			updateVision(vision, text ?? "");
		} else if (text) {
			createVision(text, user);
		}
	};

	const saveHorizon = (date: Temporal.PlainDate | undefined) => {
		const vision = data.vision();
		if (!vision || !date) return;
		const order = between(data.items().at(-1)?.order, undefined);
		saveReminder(vision, date, order, user);
	};

	return (
		<div class="flex flex-col gap-l">
			<section class="flex justify-between items-center">
				<h1 class="text-xs text-[var(--secondary)]">VISION</h1>
				<section class="flex gap-xs">
					<p class="text-[var(--secondary)]">Horizon</p>
					<DateInput date={data.vision()?.reminder?.date} setDate={saveHorizon} />
				</section>
			</section>
			<RichText placeholder="Write your vision..." value={data.vision()?.text} onInput={saveText} />
			<section class="flex flex-col gap-xs">
				<div class="flex justify-between items-center">
					<h2 class="text-xs text-[var(--secondary)]">PROJECTS</h2>
					<IconButton size={18} onClick={() => createProject("New project", true, user)}>
						add
					</IconButton>
				</div>
				<Show when={projects().length > 0}>
					<ul class="flex flex-col">
						<For each={projects()}>
							{(project) => (
								<li
									onClick={() => navigation.push(`/project/${project.id}`)}
									class="py-xs cursor-pointer active:text-[var(--secondary)]"
								>
									{project.name}
								</li>
							)}
						</For>
					</ul>
				</Show>
			</section>
			<section class="flex flex-col gap-xs">
				<div class="flex justify-between items-center">
					<h2 class="text-xs text-[var(--secondary)]">GROUPS</h2>
					<IconButton size={18} onClick={() => createProject("New group", false, user)}>
						add
					</IconButton>
				</div>
				<Show when={groups().length > 0}>
					<ul class="flex flex-col">
						<For each={groups()}>
							{(group) => (
								<li
									onClick={() => navigation.push(`/project/${group.id}`)}
									class="py-xs cursor-pointer active:text-[var(--secondary)]"
								>
									{group.name}
								</li>
							)}
						</For>
					</ul>
				</Show>
			</section>
		</div>
	);
};

export default Vision;
