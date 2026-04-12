import { useParams } from "@solidjs/router";
import { type Component, Switch, Match, Show } from "solid-js";
import { Item, MODES, Template } from "../library/types";
import { useData } from "../context/data";
import { createStore } from "solid-js/store";
import { deleteItem, deleteTemplate, updateItem, updateTemplate } from "../library/db";
import { DateInput, Input, RepeatInputs, TextArea, TimeInput } from "../components/Form";
import Button from "../components/Button";

const Edit: Component = () => {
	const params = useParams<{ id: string }>();
	const data = useData();
	const template = () => data.templates().find((t) => t.id === params.id);
	const item = () => data.items().find((i) => i.id === params.id);

	return (
		<Switch>
			<Match when={template()}>{(t) => <EditTemplate template={t()} />}</Match>
			<Match when={item()}>{(i) => <EditItem item={i()} />}</Match>
		</Switch>
	);
};

const EditTemplate: Component<{ template: Template & { instance: Item } }> = (props) => {
	const template = () => props.template;
	const [form, setForm] = createStore({
		text: template().text,
		notes: template().notes,
		start: template().start,
		end: template().end,
		mode: template().mode,
		unit: template().unit,
		interval: template().interval,
		anchor: template().anchor,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		updateTemplate(template(), {
			text: form.text,
			notes: form.notes,
			start: form.start,
			end: form.end,
			mode: form.mode,
			unit: form.unit,
			interval: form.interval,
			anchor: form.anchor,
		});
		// add navigation back to notes
	};

	const handleDelete = () => deleteTemplate(template());

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-m">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<Input
				type="text"
				placeholder="Text"
				value={form.text}
				onInput={(text) => setForm({ text })}
				autofocus
				required
			/>
			<TextArea placeholder="Notes" value={form.notes} onInput={(notes) => setForm({ notes })} />
			<Show when={template().type === "event"}>
				<section class="flex flex-col gap-xs">
					<p class="text-xs text-[var(--secondary)]">WHEN</p>
					<div class="flex gap-xs">
						<TimeInput time={form.start} setTime={(start) => setForm({ start })} />
						<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
					</div>
				</section>
			</Show>
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">REPEAT</p>
				<RepeatInputs
					modes={template().type === "event" ? MODES.slice(0, -1) : [...MODES]}
					mode={form.mode}
					interval={form.interval}
					unit={form.unit}
					anchor={form.anchor}
					setMode={(mode) => setForm({ mode })}
					setInterval={(interval) => setForm({ interval })}
					setUnit={(unit) => setForm({ unit })}
					setAnchor={(anchor) => setForm({ anchor })}
				/>
			</section>
		</form>
	);
};

const EditItem: Component<{ item: Item & { template?: Template } }> = (props) => {
	const item = () => props.item;
	const [form, setForm] = createStore({
		text: item().text,
		notes: item().notes,
		date: item().date,
		start: item().start,
		end: item().end,
	});

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		updateItem(item(), {
			text: form.text,
			notes: form.notes,
			date: form.date,
			start: form.start,
			end: form.end,
		});
		// add navigation back to notes
	};

	const handleDelete = () => deleteItem(item());

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-m">
			<section class="flex justify-between">
				<Button type="button" onClick={handleDelete}>
					Delete
				</Button>
				<Button type="submit">Save</Button>
			</section>
			<Input
				type="text"
				placeholder="Text"
				value={form.text}
				onInput={(text) => setForm({ text })}
				autofocus
				required
			/>
			<TextArea placeholder="Notes" value={form.notes} onInput={(notes) => setForm({ notes })} />
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">WHEN</p>
				<div class="flex gap-xs">
					<DateInput date={form.date} setDate={(date) => setForm({ date })} />
					<Show when={item().type === "event"}>
						<TimeInput time={form.start} setTime={(start) => setForm({ start })} />
						<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
					</Show>
				</div>
			</section>
		</form>
	);
};

export default Edit;
