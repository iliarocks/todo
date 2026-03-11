import { type Component } from "solid-js";
import { format, parse, startOfDay } from "date-fns";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore } from "solid-js/store";
import ToggleSelect from "../components/ToggleButton";
import {
	createEvent,
	createRepeatingEvent,
	createRepeatingTodo,
	createTodo,
} from "../lib/mutations";
import { db } from "../lib/db";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { FormState } from "../lib/formTypes";

const TYPES = ["todo", "event"] as const;

const Create: Component = () => {
	const auth = db.useAuth();
	const [form, setForm] = createStore<FormState>(defaultForm("todo"));

	const resetForm = (type: FormState["type"]) => setForm(defaultForm(type));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const userId = auth().user!.id;
		const date = startOfDay(parse(form.date, "yyyy-MM-dd", new Date())).toISOString();

		if (form.mode === "none") {
			if (form.type === "todo") createTodo(form.text, date, userId);
			if (form.type === "event") createEvent(form.text, date, form.startTime, form.endTime, userId);
		} else {
			if (form.type === "todo")
				createRepeatingTodo(form.text, date, form.mode, form.interval, form.unit, userId);
			if (form.type === "event")
				createRepeatingEvent(
					form.text,
					date,
					form.mode,
					form.interval,
					form.unit,
					form.anchor,
					form.startTime,
					form.endTime,
					userId,
				);
		}

		resetForm(form.type);
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
				type="text"
				placeholder="Text"
				value={form.text}
				onInput={(e) => setForm({ text: e.currentTarget.value })}
				required
			/>
			<section class="flex flex-col gap-xs">
				<p class="text-xs text-[var(--secondary)]">WHEN</p>
				<DateTimeInputs
					type={form.type}
					date={form.date}
					startTime={form.startTime}
					endTime={form.endTime}
					setForm={setForm}
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
					setForm={setForm}
				/>
			</section>
		</form>
	);
};

const defaultForm = (type: FormState["type"]): FormState => ({
	type,
	text: "",
	date: format(new Date(), "yyyy-MM-dd"),
	startTime: format(new Date(), "HH:mm"),
	endTime: format(new Date(), "HH:mm"),
	mode: "none",
	interval: 1,
	unit: "day",
	anchor: "",
});

export default Create;
