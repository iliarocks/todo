import { Show, type Component } from "solid-js";
import Button from "../components/Button";
import { createStore } from "solid-js/store";
import { now, today } from "../library/date";
import { Type, MODES, TYPES, Mode, Unit, Item } from "../library/types";
import { useNavigateToList } from "../library/navigation";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import {
	DateInput,
	Input,
	RepeatInputs,
	TextArea,
	TimeInput,
	ToggleSelect,
} from "../components/Form";
import { between } from "../library/order";
import { createItem } from "../library/db";

const Create: Component = () => {
	const user = useUser();
	const data = useData();
	const navigateToList = useNavigateToList();
	const [form, setForm] = createStore(
		buildForm({ type: "todo", date: today() }),
	);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const { type, text, notes, date, start, end, mode, unit, interval, anchor } = form;
		const base = { type, text, notes, start, end };

		const order = between(data.items().at(-1)?.order, undefined);
		const item = { ...base, date, order };
		const template =
			mode && unit && interval ? { ...base, mode, unit, interval, anchor } : undefined;

		createItem(item, user, template);
		navigateToList();
	};

	const resetForm = (type: Type) =>
		setForm(buildForm({ type, date: form.date, text: form.text, notes: form.notes }));

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-s">
			<section class="flex justify-between items-center">
				<ToggleSelect
					options={TYPES}
					selected={TYPES.indexOf(form.type)}
					onSelect={(i) => resetForm(TYPES[i])}
					single
				/>
				<Button type="submit">Save</Button>
			</section>
			<Input
				autofocus
				type="text"
				placeholder="Text"
				value={form.text}
				onInput={(text) => setForm({ text })}
				required
			/>
			<TextArea placeholder="Notes" value={form.notes} onInput={(notes) => setForm({ notes })} />
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">WHEN</p>
				<div class="flex gap-xs">
					<DateInput date={form.date} setDate={(date) => setForm({ date })} />
					<Show when={form.type === "event"}>
						<TimeInput time={form.start} setTime={(start) => setForm({ start })} />
						<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
					</Show>
				</div>
			</section>
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
		</form>
	);
};

const buildForm = (props: Pick<Item, "type" | "date"> & Partial<Pick<Item, "text" | "notes">>) => ({
	type: props.type,
	text: props.text ?? "",
	notes: props.notes,
	date: props.date,
	start: props.type === "todo" ? undefined : now(),
	end: props.type === "todo" ? undefined : now(),
	mode: undefined as Mode | undefined,
	interval: undefined as number | undefined,
	unit: undefined as Unit | undefined,
	anchor: undefined as number[] | undefined,
});

export default Create;
