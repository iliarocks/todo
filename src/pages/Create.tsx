import { type Component, Show } from "solid-js";
import { format, parse, startOfDay } from "date-fns";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore, SetStoreFunction } from "solid-js/store";
import ToggleSelect from "../components/ToggleButton";
import {
	createEvent,
	createRepeatingEvent,
	createRepeatingTodo,
	createTodo,
} from "../lib/mutations";
import { db } from "../lib/db";

const TYPES = ["todo", "event"] as const;
const MODES = ["none", "absolute", "relative"] as const;
const UNITS = ["day", "week", "month"] as const;
const WEEK_DAYS = ["s", "m", "t", "w", "t", "f", "s"] as const;
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));


type FormType = (typeof TYPES)[number];
type Mode = (typeof MODES)[number];
type Unit = (typeof UNITS)[number];

type FormState = {
	type: FormType;
	text: string;
	date: string;
	startTime: string;
	endTime: string;
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: string;
};

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

const DateTimeInputs: Component<{
	type: "todo" | "event";
	date: string;
	startTime: string;
	endTime: string;
	setForm: SetStoreFunction<FormState>;
}> = (props) => {
	const isEvent = () => props.type === "event";

	return (
		<div class="flex gap-xs">
			<Input
				type="date"
				value={props.date}
				onInput={(e) => props.setForm({ date: e.currentTarget.value })}
				required
			/>
			<Show when={isEvent()}>
				<Input
					type="time"
					value={props.startTime}
					onInput={(e) => props.setForm({ startTime: e.currentTarget.value })}
					required
				/>
				<Input
					type="time"
					value={props.endTime}
					onInput={(e) => props.setForm({ endTime: e.currentTarget.value })}
					required
				/>
			</Show>
		</div>
	);
};

const RepeatInputs: Component<{
	type: FormType;
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: string;
	setForm: SetStoreFunction<FormState>;
}> = (props) => {
	const modes = () => (props.type === "event" ? MODES.slice(0, -1) : MODES);
	const anchorSelected = () => (props.anchor ? props.anchor.split(" ").map(Number) : [0]);
	const showAnchor = () => props.mode === "absolute" && props.unit !== "day";

	return (
		<div class="flex flex-col gap-s">
			<ToggleSelect
				options={modes()}
				selected={[modes().indexOf(props.mode)]}
				onSelect={([i]) => {
					const mode = modes()[i];
					props.setForm({ mode, anchor: mode === "absolute" && props.unit !== "day" ? "0" : "" });
				}}
				single
			/>
			<Show when={props.mode !== "none"}>
				<div class="flex items-center gap-xs">
					<span class="text-[var(--secondary)]">Every</span>
					<Input
						type="number"
						value={props.interval}
						onInput={(e) => props.setForm({ interval: Number(e.currentTarget.value) })}
						class="py-xs w-12 text-center"
						required
					/>
					<div class="grow">
						<ToggleSelect
							options={UNITS}
							selected={[UNITS.indexOf(props.unit)]}
							onSelect={([i]) => {
								const unit = UNITS[i];
								props.setForm({ unit, anchor: unit === "day" ? "" : "0" });
							}}
							single
						/>
					</div>
				</div>
			</Show>
			<Show when={showAnchor()}>
				<ToggleSelect
					options={props.unit === "week" ? WEEK_DAYS : MONTH_DAYS}
					selected={anchorSelected()}
					onSelect={(indices) => props.setForm({ anchor: indices.join(" ") })}
					cols={props.unit === "month" ? 7 : undefined}
				/>
			</Show>
		</div>
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
