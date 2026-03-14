import { type Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore } from "solid-js/store";
import ToggleSelect from "../components/ToggleButton";
import { createEvent, createTodo } from "../lib/mutations";
import { db } from "../lib/db";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { FormState, TYPES } from "../lib/form";
import { now, today } from "../lib/dates";

const Create: Component = () => {
	const auth = db.useAuth();
	const navigate = useNavigate();
	const [form, setForm] = createStore<FormState>(defaultForm("todo"));

	const resetForm = (type: FormState["type"]) => setForm(defaultForm(type));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const { text, date, start, end, mode, interval, unit, anchor } = form;
		const user = auth().user;
		if (!user) return;

		if (form.type === "todo") createTodo(text, form.notes, date, mode, interval, unit, anchor, user);
		if (form.type === "event")
			createEvent(text, form.notes, date, start, end, mode, interval, unit, anchor, user);

		navigate(-1);
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-[24px]">
			<section class="flex justify-between items-center">
				<ToggleSelect
					options={TYPES}
					selected={[TYPES.indexOf(form.type)]}
					onSelect={([i]) => resetForm(TYPES[i])}
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
			<textarea
				placeholder="Notes"
				value={form.notes}
				onInput={(e) => setForm({ notes: e.currentTarget.value })}
				class="p-s rounded-lg bg-[var(--surface)] resize-none field-sizing-content min-h-[2.5rem]"
			/>
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">WHEN</p>
				<DateTimeInputs
					type={form.type}
					date={form.date}
					start={form.start}
					end={form.end}
					setDate={(date) => setForm({ date })}
					setStart={(start) => setForm({ start })}
					setEnd={(end) => setForm({ end })}
				/>
			</section>
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">REPEAT</p>
				<RepeatInputs
					type={form.type}
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

const defaultForm = (type: FormState["type"]): FormState => ({
	type,
	text: "",
	notes: "",
	date: today(),
	start: now(),
	end: now(),
	mode: "none",
	interval: 1,
	unit: "day",
	anchor: "",
});

export default Create;
