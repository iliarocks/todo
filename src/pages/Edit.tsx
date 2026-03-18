import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { db } from "../lib/db";
import {
	parseItemWithTemplate,
	parseTemplateWithInstance,
	Item,
	Template,
	Event,
	EventTemplate,
	MODES,
} from "../lib/types";
import { today } from "../lib/dates";
import Button from "../components/Button";
import Input from "../components/Input";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import {
	CreateParameters,
	updateItem,
	updateTemplate,
	deleteItem,
	deleteTemplate,
} from "../lib/mutations";
import { between } from "../lib/order";
import { Temporal } from "temporal-polyfill";

const Edit: Component = () => {
	const params = useParams<{ source: string; id: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const auth = db.useAuth();

	const itemQuery = db.useQuery({ items: { template: {}, $: { where: { id: params.id } } } });
	const templateQuery = db.useQuery({
		templates: { instance: {}, $: { where: { id: params.id } } },
	});
	const orderState = db.useQuery({
		items: { $: { order: { order: "desc" }, limit: 1 } },
	});

	const loaded = () => {
		if (params.source === "template") {
			const raw = templateQuery().data?.templates?.[0];
			return raw ? parseTemplateWithInstance(raw) ?? undefined : undefined;
		}
		const raw = itemQuery().data?.items?.[0];
		return raw ? parseItemWithTemplate(raw) : undefined;
	};

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
						const order = wasFuture && isNow
							? between(orderState().data?.items?.[0]?.order, undefined)
							: undefined;
						updateItem(item.id, form, item.template?.id, order);
					}

					navigate(`/notes/${isTemplate ? "template" : "instance"}/${data().id}`);
				};

				const handleDelete = () => {
					if (isTemplate) {
						deleteTemplate((data() as Template).id);
					} else {
						const user = auth().user;
						if (user) {
							deleteItem(data() as Item & { template?: Template }, user);
						}
					}

					navigate((location.state as any)?.origin ?? "/upcoming", { replace: true });
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
		start: data.type === "event" ? (data as Event).start : undefined,
		end: data.type === "event" ? (data as Event).end : undefined,
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
		start: isEvent ? (data as EventTemplate).start : undefined,
		end: isEvent ? (data as EventTemplate).end : undefined,
		mode: data.mode,
		interval: data.interval,
		unit: data.unit,
		anchor: data.mode === "absolute" ? data.anchor : undefined,
	};
};

export default Edit;
