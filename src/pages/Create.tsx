import { type Component, Show, For } from "solid-js";
import { format, parse, startOfDay } from "date-fns";
import Button from "../components/Button";
import Input from "../components/Input";
import { createStore, SetStoreFunction } from "solid-js/store";
import CycleButton from "../components/CycleButton";
import {
	createEvent,
	createRepeatingEvent,
	createRepeatingTodo,
	createTodo,
} from "../lib/mutations";
import { db } from "../lib/db";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

type FormState = {
	type: "todo" | "event";
	text: string;
	date: string;
	startTime: string;
	endTime: string;
	mode: "none" | "relative" | "absolute";
	interval: number;
	unit: "day" | "week" | "month";
	anchor: string;
};

const Create: Component = () => {
	const auth = db.useAuth();
	const [form, setForm] = createStore<FormState>(defaultForm("todo"));

	const resetForm = (type: FormState["type"]) => setForm(defaultForm(type));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const userId = auth().user!.id;
		const date = startOfDay(
			parse(form.date, "yyyy-MM-dd", new Date()),
		).toISOString();

		if (form.mode === "none") {
			if (form.type === "todo") createTodo(form.text, date, userId);
			if (form.type === "event")
				createEvent(form.text, date, form.startTime, form.endTime, userId);
		} else {
			if (form.type === "todo")
				createRepeatingTodo(
					form.text,
					date,
					form.mode,
					form.interval,
					form.unit,
					userId,
				);
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
		<div>
			<form onSubmit={handleSubmit} class="flex flex-col gap-s">
				<section class="flex justify-between">
					<CycleButton
						values={["todo", "event"]}
						current={form.type}
						onChange={(value) => resetForm(value as FormState["type"])}
					/>
					<Button type="submit">Submit</Button>
				</section>
				<Input
					type="text"
					placeholder="Text"
					value={form.text}
					onInput={(e) => setForm({ text: e.currentTarget.value })}
					required
				/>
				<DateTimeInputs
					type={form.type}
					date={form.date}
					startTime={form.startTime}
					endTime={form.endTime}
					setDate={(date) => setForm({ date })}
					setStartTime={(startTime) => setForm({ startTime })}
					setEndTime={(endTime) => setForm({ endTime })}
				/>
				<RepeatInputs
					modes={
						form.type === "event"
							? ["none", "absolute"]
							: ["none", "relative", "absolute"]
					}
					mode={form.mode}
					interval={form.interval}
					unit={form.unit}
					anchor={form.anchor}
					setForm={setForm}
				/>
			</form>
		</div>
	);
};

const DateTimeInputs: Component<{
	type: "todo" | "event";
	date: string;
	setDate: (d: string) => void;
	startTime: string;
	setStartTime: (t: string) => void;
	endTime: string;
	setEndTime: (t: string) => void;
}> = (props) => {
	return (
		<div class="flex gap-xs">
			<Input
				type="date"
				value={props.date}
				onInput={(e) => props.setDate(e.currentTarget.value)}
				required
			/>
			<Show when={props.type === "event"}>
				<Input
					type="time"
					value={props.startTime}
					onInput={(e) => props.setStartTime(e.currentTarget.value)}
					required
				/>
				<Input
					type="time"
					value={props.endTime}
					onInput={(e) => props.setEndTime(e.currentTarget.value)}
					required
				/>
			</Show>
		</div>
	);
};

const RepeatInputs: Component<{
	modes: string[];
	mode: "none" | "relative" | "absolute";
	interval: number;
	unit: "day" | "week" | "month";
	anchor: string;
	setForm: SetStoreFunction<FormState>;
}> = (props) => {
	const anchorConfig = () => {
		if (props.mode !== "absolute") return null;
		if (props.unit === "week") return { values: WEEK_DAYS };
		if (props.unit === "month") return { values: MONTH_DAYS, cols: 7 };
		return null;
	};

	const anchorSelected = () =>
		props.anchor ? props.anchor.split(" ").map(Number) : [0];

	return (
		<div class="flex flex-col gap-s">
			<div class="flex gap-xs">
				<CycleButton
					values={props.modes}
					current={props.mode}
					onChange={(value) => {
						const mode = value as FormState["mode"];
						props.setForm({
							mode,
							anchor: mode === "absolute" && props.unit !== "day" ? "0" : "",
						});
					}}
				/>
				<Show when={props.mode !== "none"}>
					<Input
						type="number"
						value={props.interval}
						onInput={(e) =>
							props.setForm({ interval: Number(e.currentTarget.value) })
						}
						class="w-16 text-center"
						required
					/>
					<CycleButton
						values={["day", "week", "month"]}
						current={props.unit}
						onChange={(value) => {
							const unit = value as FormState["unit"];
							props.setForm({ unit, anchor: unit === "day" ? "" : "0" });
						}}
					/>
				</Show>
			</div>
			<Show when={anchorConfig()}>
				{(config) => (
					<ChipSelect
						values={config().values}
						cols={config().cols}
						selected={anchorSelected()}
						onChange={(indices) => props.setForm({ anchor: indices.join(" ") })}
					/>
				)}
			</Show>
		</div>
	);
};

const ChipSelect: Component<{
	values: readonly string[];
	selected: readonly number[];
	onChange: (indices: number[]) => void;
	cols?: number;
}> = (props) => {
	const cols = () => props.cols ?? props.values.length;

	const toggle = (i: number) => {
		const next = props.selected.includes(i)
			? props.selected.filter((x) => x !== i)
			: [...props.selected, i].sort((a, b) => a - b);
		if (next.length > 0) props.onChange(next);
	};

	return (
		<div
			class="grid gap-xs w-full"
			style={{ "grid-template-columns": `repeat(${cols()}, 1fr)` }}
		>
			<For each={props.values}>
				{(value, i) => (
					<button
						type="button"
						onClick={() => toggle(i())}
						class={`w-full p-xs cursor-pointer text-center ${
							props.selected.includes(i())
								? "bg-[var(--primary)] text-[var(--background)]"
								: "bg-[var(--tertiary)]"
						}`}
					>
						{value}
					</button>
				)}
			</For>
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
