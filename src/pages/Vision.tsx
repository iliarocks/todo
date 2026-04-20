import { type Component, For, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import { createGroup, createVision, updateVision, saveReminder } from "../library/db";
import { useNavigation } from "../library/navigation";
import { MonthInput, Button, RichInput } from "../components/Input";
import { between } from "../library/order";
import Icon from "../components/Icon";

const Vision: Component = () => {
	const user = useUser();
	const data = useData();
	const navigation = useNavigation();

	const projects = () => data.groups().filter((p) => p.active);
	const groups = () => data.groups().filter((p) => !p.active);

	const saveText = (text: string) => {
		const vision = data.vision();
		if (vision) {
			updateVision(vision, text);
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
		<div class="flex flex-col gap-l px-xs">
			<section class="flex gap-xs items-center">
				<p class="text-[var(--secondary)]">My life in</p>
				<MonthInput date={data.vision()?.reminder?.date} setDate={saveHorizon} />
			</section>
			<RichInput placeholder="Write your vision..." value={data.vision()?.text ?? ""} onInput={saveText} />
			<section class="flex flex-col gap-xs">
				<div class="flex justify-between items-center">
					<h2 class="text-xs text-[var(--secondary)]">PROJECTS</h2>
					<Button onClick={() => createGroup("New project", true, user)}>
						<Icon size={18}>add</Icon>
					</Button>
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
					<Button onClick={() => createGroup("New group", false, user)}>
						<Icon size={18}>add</Icon>
					</Button>
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
