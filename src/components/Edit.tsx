import { Component, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Item, MODES, Project, Template } from "../library/types";
import { deleteItem, deleteTemplate, linkItemProject, linkTemplateProject, unlinkItemProject, unlinkTemplateProject, updateItem, updateTemplate } from "../library/db";
import { DateInput, ProjectSelect, RepeatInputs, TimeInput } from "./Form";
import Button from "./Button";
import Modal from "./Modal";

const Edit: Component<{
	item?: Item & { template?: Template };
	template?: Template & { instance: Item };
	projects: Project[];
	projectId: string | undefined;
	open: boolean;
	onClose: () => void;
}> = (props) => {
	return (
		<Modal open={props.open} onClose={props.onClose}>
			<Switch>
				<Match when={props.template}>
					{(t) => (
						<EditTemplateForm
							template={t()}
							projects={props.projects}
							projectId={props.projectId}
							onClose={props.onClose}
						/>
					)}
				</Match>
				<Match when={props.item}>
					{(i) => (
						<EditItemForm
							item={i()}
							projects={props.projects}
							projectId={props.projectId}
							onClose={props.onClose}
						/>
					)}
				</Match>
			</Switch>
		</Modal>
	);
};

const EditTemplateForm: Component<{
	template: Template & { instance: Item };
	projects: Project[];
	projectId: string | undefined;
	onClose: () => void;
}> = (props) => {
	const template = () => props.template;
	const [form, setForm] = createStore({
		start: template().start,
		end: template().end,
		mode: template().mode,
		unit: template().unit,
		interval: template().interval,
		anchor: template().anchor,
		projectId: props.projectId,
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
		if (form.projectId !== props.projectId) {
			const instanceId = template().instance.id;
			if (props.projectId) {
				unlinkTemplateProject(template().id, props.projectId);
				unlinkItemProject(instanceId, props.projectId);
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
		props.onClose();
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-s">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<Show when={template().type === "event"}>
				<div class="flex gap-xs">
					<TimeInput time={form.start} setTime={(start) => setForm({ start })} />
					<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
				</div>
			</Show>
			<ProjectSelect
				projects={props.projects}
				selected={form.projectId}
				onSelect={(projectId) => setForm({ projectId })}
			/>
			<RepeatInputs
				modes={template().type === "event" ? MODES.slice(0, -1) : [...MODES]}
				mode={form.mode}
				interval={form.interval}
				unit={form.unit}
				anchor={form.anchor}
				allowNone={false}
				setMode={(mode) => setForm({ mode })}
				setInterval={(interval) => setForm({ interval })}
				setUnit={(unit) => setForm({ unit })}
				setAnchor={(anchor) => setForm({ anchor })}
			/>
		</form>
	);
};

const EditItemForm: Component<{
	item: Item & { template?: Template };
	projects: Project[];
	projectId: string | undefined;
	onClose: () => void;
}> = (props) => {
	const item = () => props.item;
	const [form, setForm] = createStore({
		date: item().date,
		start: item().start,
		end: item().end,
		projectId: props.projectId,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		updateItem(item(), { date: form.date, start: form.start, end: form.end });
		if (form.projectId !== props.projectId) {
			if (props.projectId) unlinkItemProject(item().id, props.projectId);
			if (form.projectId) linkItemProject(item().id, form.projectId);
		}
		props.onClose();
	};

	const handleDelete = () => {
		deleteItem(item());
		props.onClose();
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-s">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<div class="flex gap-xs">
				<DateInput date={form.date} setDate={(date) => setForm({ date })} />
				<Show when={item().type === "event"}>
					<TimeInput time={form.start} setTime={(start) => setForm({ start })} />
					<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
				</Show>
			</div>
			<ProjectSelect
				projects={props.projects}
				selected={form.projectId}
				onSelect={(projectId) => setForm({ projectId })}
			/>
		</form>
	);
};

export default Edit;
