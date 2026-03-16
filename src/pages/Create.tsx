import { type Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore } from "solid-js/store";
import ToggleSelect from "../components/ToggleSelect";
import { createItem, CreateParameters } from "../lib/mutations";
import { db } from "../lib/db";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { now, today } from "../lib/dates";
import { TYPES } from "../lib/types";

const Create: Component = () => {
	const auth = db.useAuth();
	const navigate = useNavigate();
	const [form, setForm] = createStore<CreateParameters>(defaultForm("todo"));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const user = auth().user;

		if (user) {
			createItem(form, user);
			navigate(-1);
		}
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-s">
			<section class="flex justify-between items-center">
				<ToggleSelect
					options={TYPES}
					selected={TYPES.indexOf(form.type)}
					onSelect={(i) => setForm(defaultForm(TYPES[i]))}
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
				value={form.notes ?? ""}
				onInput={(e) => setForm({ notes: e.currentTarget.value || undefined })}
				class="p-s rounded-lg bg-[var(--surface)] resize-none field-sizing-content min-h-[2.5rem]"
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

const defaultForm = (type: CreateParameters["type"]): CreateParameters => ({
	type,
	text: "",
	notes: undefined,
	date: today(),
	start: type === "todo" ? undefined : now(),
	end: type === "todo" ? undefined : now(),
	mode: undefined,
	interval: undefined,
	unit: undefined,
	anchor: undefined,
});

export default Create;
