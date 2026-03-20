import { type Component } from "solid-js";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore } from "solid-js/store";
import ToggleSelect from "../components/ToggleSelect";
import { createItem, CreateParameters } from "../lib/mutations";
import { db, queries } from "../lib/db";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { now, today } from "../lib/dates";
import { Type, MODES, TYPES } from "../lib/types";
import { useNavigateToList } from "../lib/navigation";
import { useUser } from "../context/auth";

const Create: Component = () => {
	const user = useUser();
	const orderState = db.useQuery(queries(user.id).lastOrder);
	const navigateToList = useNavigateToList();
	const [form, setForm] = createStore<CreateParameters>(defaultForm("todo"));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const lastOrder = orderState().data?.items?.[0]?.order;

		if (user) {
			createItem(form, user, lastOrder);
			navigateToList();
		}
	};

	const resetForm = (type: Type) => setForm(defaultForm(type, form.text, form.notes));

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
				onInput={(e) => setForm({ text: e.currentTarget.value })}
				required
			/>
			<Input
				placeholder="Notes"
				value={form.notes ?? ""}
				onInput={(e) => setForm({ notes: e.currentTarget.value || undefined })}
				multiline
			/>
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

const defaultForm = (type: Type, text?: string, notes?: string) => ({
	type,
	text: text ?? "",
	notes: notes ?? undefined,
	date: today(),
	start: type === "todo" ? undefined : now(),
	end: type === "todo" ? undefined : now(),
	mode: undefined,
	interval: undefined,
	unit: undefined,
	anchor: undefined,
});

export default Create;
