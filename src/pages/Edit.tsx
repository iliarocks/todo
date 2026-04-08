import { useNavigate, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { Item, Template, MODES } from "../library/types";
import { today } from "../library/date";
import Button from "../components/Button";
import Input from "../components/Input";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import {
	CreateParameters,
	updateItem,
	updateTemplate,
	deleteTemplate,
} from "../library/mutations";
import { between } from "../library/order";
import { Temporal } from "temporal-polyfill";
import { useNavigateToList } from "../library/navigation";
import { useData } from "../context/data";
import { useUser } from "../context/auth";
import { deleteItem } from "../library/db";

const Edit: Component = () => {
	const params = useParams<{ source: string; id: string }>();
	const navigate = useNavigate();
	const navigateToList = useNavigateToList();
	const data = useData();
	const user = useUser();

	const loaded = () => {
		if (params.source === "template") return data.templates().find((t) => t.id === params.id);
		return data.items().find((i) => i.id === params.id);
	};

	const lastOrder = () => data.items().at(-1)?.order;

	return (
		<Show when={loaded()}>
			{(data) => {
				const isTemplate = "instance" in data();
				const [form, setForm] = createStore<CreateParameters>(
					isTemplate
						? initializeTemplate(data() as Template & { instance: Item })
						: initializeItem(data() as Item & { template?: Template }),
				);

				const handleSubmit = (e: SubmitEvent) => {
					e.preventDefault();

					if (isTemplate) {
						const template = data() as Template & { instance: Item };
						updateTemplate(template.id, template.instance.id, form);
					} else {
						const item = data() as Item & { template?: Template };
						const wasFuture = Temporal.PlainDate.compare(item.date, today()) > 0;
						const isNow = Temporal.PlainDate.compare(form.date, today()) <= 0;
						const order =
							wasFuture && isNow
								? between(lastOrder(), undefined)
								: undefined;
						updateItem(item.id, form, item.template?.id, order);
					}

					navigate(`/notes/${isTemplate ? "template" : "instance"}/${data().id}`);
				};

				const handleDelete = () => {
					if (isTemplate) {
						deleteTemplate((data() as Template).id);
					} else {
						deleteItem(data() as Item & { template?: Template }, user);
					}

					navigateToList();
				};

				return (
					<form onSubmit={handleSubmit} class="flex flex-col gap-s">
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
							onInput={(e) => setForm({ text: e.currentTarget.value })}
							required
							autofocus
						/>
						<Input
							placeholder="Notes"
							value={form.notes ?? ""}
							onInput={(e) => setForm({ notes: e.currentTarget.value || undefined })}
							multiline
						/>
						<Show when={!isTemplate}>
							<section class="flex flex-col gap-xs">
								<p class="text-xs text-[var(--secondary)]">WHEN</p>
								<DateTimeInputs
									date={form.date}
									start={form.start}
									end={form.end}
									setDate={(date) => setForm({ date })}
									setStart={(start) => setForm({ start })}
									setEnd={(end) => setForm({ end })}
									time={form.type === "event"}
								/>
							</section>
						</Show>
						<Show when={isTemplate}>
							<section class="flex flex-col gap-xs">
								<p class="text-xs text-[var(--secondary)]">REPEAT</p>
								<RepeatInputs
									modes={form.type === "event" ? MODES.slice(0, -1) : [...MODES]}
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
						</Show>
					</form>
				);
			}}
		</Show>
	);
};

const initializeItem = (data: Item & { template?: Template }): CreateParameters => {
	const tpl = data.template;
	return {
		type: data.type,
		text: data.text,
		notes: data.notes,
		date: data.date,
		start: data.type === "event" ? data.start : undefined,
		end: data.type === "event" ? data.end : undefined,
		mode: tpl?.mode,
		interval: tpl?.interval,
		unit: tpl?.unit,
		anchor: tpl?.mode === "absolute" ? tpl.anchor : undefined,
	};
};

const initializeTemplate = (data: Template & { instance: Item }): CreateParameters => {
	const isEvent = data.type === "event";
	return {
		type: data.type,
		text: data.text,
		notes: data.notes,
		date: data.instance.date,
		start: isEvent ? data.start : undefined,
		end: isEvent ? data.end : undefined,
		mode: data.mode,
		interval: data.interval,
		unit: data.unit,
		anchor: data.mode === "absolute" ? data.anchor : undefined,
	};
};

export default Edit;
