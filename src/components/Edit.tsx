import { Component, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Group, Item, Mode, MODES, Template, Unit } from "../library/types";
import { useData } from "../context/data";
import { useNavigation } from "../library/navigation";
import {
	deleteItem,
	deleteTemplate,
	linkItemGroup,
	linkTemplateGroup,
	unlinkItemGroup,
	unlinkTemplateGroup,
	updateItem,
	updateTemplate,
} from "../library/db";
import { DateInput, GroupSelect, RepeatInputs, TimeInput, Button } from "./Input";
import Modal from "./Modal";
import { Temporal } from "temporal-polyfill";

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

type TemplateForm = {
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	mode: Mode;
	unit: Unit;
	interval: number;
	anchor: number[];
	group?: Pick<Group, "id">;
}

const EditTemplateForm: Component<{
	template: Template;
	onClose: () => void;
}> = (props) => {
	const data = useData();
	const navigation = useNavigation();
	const template = () => props.template;
	const [form, setForm] = createStore<TemplateForm>({
		start: template().start,
		end: template().end,
		mode: template().mode,
		unit: template().unit,
		interval: template().interval,
		anchor: template().anchor,
		group: template().group,
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

		const originalProject = template().group;
		if (form.group?.id !== originalProject?.id) {

			if (originalProject) {
				unlinkTemplateGroup(template().id, originalProject.id);
				unlinkItemGroup(template().instance.id, originalProject.id);
			}
			if (form.group) {
				linkTemplateGroup(template().id, form.group.id);
				linkItemGroup(template().instance.id, form.group.id);
			}
		}
		props.onClose();
	};

	const handleDelete = () => {
		deleteTemplate(template());
		props.onClose();
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
				<Show when={template().type === "event"}>
					<section class="flex gap-xs">
						<TimeInput time={form.start} setTime={(start) => setForm({ start })} required />
						<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
					</section>
				</Show>
				<GroupSelect
					projects={data.groups()}
					selected={form.group?.id}
					onSelect={(id) =>  setForm({ group: id ? { id } : undefined })}
				/>
			</section>
			<RepeatInputs
				modes={template().type === "event" ? MODES.slice(0, -1) : [...MODES]}
				mode={form.mode}
				interval={form.interval}
				unit={form.unit}
				anchor={form.anchor}
				onChange={(patch) => setForm(patch)}
			/>
		</form>
	);
};

type ItemForm = {
	date: Temporal.PlainDate;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	group?: Pick<Group, "id">;
};

const EditItemForm: Component<{
	item: Item;
	onClose: () => void;
}> = (props) => {
	const data = useData();
	const navigation = useNavigation();
	const item = () => props.item;
	const [form, setForm] = createStore<ItemForm>({
		date: item().date,
		start: item().start,
		end: item().end,
		group: item().group,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		updateItem(item(), { date: form.date, start: form.start, end: form.end });
		const originalGroup = item().group;
		if (form.group?.id !== originalGroup?.id) {
			if (originalGroup) unlinkItemGroup(item().id, originalGroup.id);
			if (form.group) linkItemGroup(item().id, form.group.id);
		}
		props.onClose();
	};

	const handleDelete = () => {
		deleteItem(item());
		props.onClose();
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
					<Show when={item().type === "event"}>
						<TimeInput time={form.start} setTime={(start) => setForm({ start })} required />
						<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
					</Show>
				</section>
				<GroupSelect
					projects={data.groups()}
					selected={form.group?.id}
					onSelect={(id) =>  setForm({ group: id ? { id } : undefined })}
				/>
			</section>
		</form>
	);
};

export default Edit;
