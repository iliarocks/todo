import { Component, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Item, MODES, Template } from "../library/types";
import { useData } from "../context/data";
import { useNavigation } from "../library/navigation";
import {
	deleteItem,
	deleteTemplate,
	linkItemProject,
	linkTemplateProject,
	unlinkItemProject,
	unlinkTemplateProject,
	updateItem,
	updateTemplate,
} from "../library/db";
import { DateInput, ProjectSelect, RepeatInputs, TimeInput } from "./Form";
import Button from "./Button";
import Modal from "./Modal";

const Edit: Component<{
	item?: Item;
	template?: Template;
	onClose: () => void;
}> = (props) => {
	return (
		<Modal onClose={props.onClose}>
			<Switch>
				<Match when={props.template}>
					{(t) => <EditTemplateForm template={t()} onClose={props.onClose} />}
				</Match>
				<Match when={props.item}>
					{(i) => <EditItemForm item={i()} onClose={props.onClose} />}
				</Match>
			</Switch>
		</Modal>
	);
};

const EditTemplateForm: Component<{
	template: Template;
	onClose: () => void;
}> = (props) => {
	const data = useData();
	const navigation = useNavigation();
	const template = () => props.template;
	const [form, setForm] = createStore({
		start: template().start,
		end: template().end,
		mode: template().mode,
		unit: template().unit,
		interval: template().interval,
		anchor: template().anchor,
		projectId: template().project?.id,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		updateTemplate(template(), {
			start: form.start,
			end: form.end,
			mode: form.mode,
			unit: form.unit,
			interval: form.interval,
			anchor: form.anchor,
		});
		const originalProjectId = template().project?.id;
		if (form.projectId !== originalProjectId) {
			const instanceId = template().instance.id;
			if (originalProjectId) {
				unlinkTemplateProject(template().id, originalProjectId);
				unlinkItemProject(instanceId, originalProjectId);
			}
			if (form.projectId) {
				linkTemplateProject(template().id, form.projectId);
				linkItemProject(instanceId, form.projectId);
			}
		}
		props.onClose();
	};

	const handleDelete = () => {
		deleteTemplate(template());
		navigation.back();
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-m">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<section class="flex justify-between">
				<Show when={template().type === "event" && form.start && form.end}>
					<section class="flex gap-xs">
						<TimeInput time={form.start!} setTime={(start) => setForm({ start })} />
						<TimeInput time={form.end!} setTime={(end) => setForm({ end })} />
					</section>
				</Show>
				<ProjectSelect
					projects={data.projects()}
					selected={form.projectId}
					onSelect={(projectId) => setForm({ projectId })}
				/>
			</section>
			<RepeatInputs
				modes={template().type === "event" ? MODES.slice(0, -1) : [...MODES]}
				mode={form.mode}
				interval={form.interval}
				unit={form.unit}
				anchor={form.anchor!}
				onChange={(patch) => setForm(patch)}
			/>
		</form>
	);
};

const EditItemForm: Component<{
	item: Item;
	onClose: () => void;
}> = (props) => {
	const data = useData();
	const navigation = useNavigation();
	const item = () => props.item;
	const [form, setForm] = createStore({
		date: item().date,
		start: item().start,
		end: item().end,
		projectId: item().project?.id,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		updateItem(item(), { date: form.date, start: form.start, end: form.end });
		const originalProjectId = item().project?.id;
		if (form.projectId !== originalProjectId) {
			if (originalProjectId) unlinkItemProject(item().id, originalProjectId);
			if (form.projectId) linkItemProject(item().id, form.projectId);
		}
		props.onClose();
	};

	const handleDelete = () => {
		deleteItem(item());
		navigation.back();
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-m">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<section class="flex justify-between">
				<section class="flex gap-xs">
					<DateInput date={form.date} setDate={(date) => setForm({ date })} />
					<Show when={item().type === "event" && form.start && form.end}>
						<TimeInput time={form.start!} setTime={(start) => setForm({ start })} />
						<TimeInput time={form.end!} setTime={(end) => setForm({ end })} />
					</Show>
				</section>
				<ProjectSelect
					projects={data.projects()}
					selected={form.projectId}
					onSelect={(projectId) => setForm({ projectId })}
				/>
			</section>
		</form>
	);
};

export default Edit;
