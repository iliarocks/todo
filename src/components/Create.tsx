import { Show, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { Type, MODES, TYPES, Mode, Unit, Group } from "../library/types";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import {
	DateInput,
	GroupSelect,
	Input,
	RepeatInputs,
	RepeatToggle,
	TimeInput,
	ToggleSelect,
	Button,
	RichInput,
} from "./Input";
import { between } from "../library/order";
import { createItem } from "../library/db";
import Modal from "./Modal";
import { Temporal } from "temporal-polyfill";
import { now, today } from "../library/date";

type Form = {
	type: Type;
	text: string;
	notes?: string;
	date: Temporal.PlainDate;
	start?: Temporal.PlainTime;
	end?: Temporal.PlainTime;
	mode?: Mode;
	unit?: Unit;
	interval?: number;
	anchor: number[];
	group?: Pick<Group, "id">;
};

const defaultForm = (): Form => ({ type: "todo", text: "", date: today(), anchor: [] });

const Create: Component<{
	onClose: () => void;
}> = (props) => {
	const user = useUser();
	const data = useData();
	const [form, setForm] = createStore<Form>(defaultForm());

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const { type, text, notes, date, start, end, mode, unit, interval, anchor, group } = form;
		const base = { type, text, notes, start, end };

		const order = between(data.items().at(-1)?.order, undefined);
		const item = { ...base, date, order };
		const template =
			mode && unit && interval ? { ...base, mode, unit, interval, anchor } : undefined;

		createItem(item, user, template, group);
		props.onClose();
	};

	const selectType = (type: Type) => {
		if (type === form.type) return;

		setForm({
			type,
			start: type === "event" ? now() : undefined,
			end: type === "event" ? now() : undefined,
			mode: undefined,
			unit: undefined,
			interval: undefined,
			anchor: [],
		});
	};

	const toggleRepeat = () => {
		if (form.mode) {
			setForm({ mode: undefined, interval: undefined, unit: undefined, anchor: [] });
		} else {
			setForm({ mode: "absolute", unit: "day", interval: 1, anchor: [] });
		}
	};

	return (
		<Modal onClose={props.onClose}>
			<form onSubmit={handleSubmit} class="flex flex-col gap-m">
				<section class="flex justify-between items-center">
					<ToggleSelect
						options={TYPES}
						selected={TYPES.indexOf(form.type)}
						onClick={(i) => selectType(TYPES[i])}
					/>
					<Button type="submit">Save</Button>
				</section>
				<Input
					type="text"
					placeholder="Title"
					value={form.text}
					onInput={(text) => setForm({ text })}
					class="text-lg font-medium"
					autofocus
					required
				/>
				<RichInput
					placeholder="Notes"
					value={form.notes ?? ""}
					onInput={(notes) => setForm({ notes: notes || undefined })}
				/>
				<hr class="text-[var(--border)]" />
				<section class="flex gap-m overflow-x-auto">
					<section class="flex gap-xs shrink-0">
						<DateInput date={form.date} setDate={(date) => setForm({ date })} required />
						<Show when={form.type === "event"}>
							<TimeInput time={form.start} setTime={(start) => setForm({ start })} required />
							<TimeInput time={form.end} setTime={(end) => setForm({ end })} />
						</Show>
					</section>
					<section class="flex gap-m shrink-0 ml-auto">
						<RepeatToggle repeat={form.mode !== undefined} onClick={() => toggleRepeat()} />
						<GroupSelect
							projects={data.groups()}
							selected={form.group?.id}
							onSelect={(id) => setForm({ group: id ? { id } : undefined })}
						/>
					</section>
				</section>
				<Show when={form.mode}>
					<RepeatInputs
						modes={form.type === "event" ? MODES.slice(0, -1) : [...MODES]}
						mode={form.mode!}
						interval={form.interval!}
						unit={form.unit!}
						anchor={form.anchor}
						onChange={(update) => setForm(update)}
					/>
				</Show>
			</form>
		</Modal>
	);
};

export default Create;
