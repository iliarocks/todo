import { Show, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { now, today } from "../library/date";
import { Type, MODES, TYPES, Mode, Unit, Item, Project } from "../library/types";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import {
	DateInput,
	Input,
	ProjectSelect,
	RepeatInputs,
	RepeatToggle,
	RichText,
	TimeInput,
	ToggleSelect,
} from "./Form";
import { between } from "../library/order";
import { createItem } from "../library/db";
import Button from "./Button";
import Modal from "./Modal";

const Create: Component<{
	onClose: () => void;
}> = (props) => {
	const user = useUser();
	const data = useData();
	const [form, setForm] = createStore(buildForm({ type: "todo", date: today() }));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const { type, text, notes, date, start, end, mode, unit, interval, anchor, projectId } = form;
		const base = { type, text, notes, start, end };

		const order = between(data.items().at(-1)?.order, undefined);
		const item = { ...base, date, order };
		const template =
			mode && unit && interval ? { ...base, mode, unit, interval, anchor } : undefined;
		const project = projectId ? { id: projectId } : undefined;

		createItem(item, user, template, project);
		clear();
		props.onClose();
	};

	const selectType = (type: Type) =>
		setForm(
			buildForm({
				type,
				date: form.date,
				text: form.text,
				notes: form.notes,
				projectId: form.projectId,
			}),
		);

	const clear = () => setForm(buildForm({ type: "todo", date: today() }));

	const onClose = () => {
		clear();
		props.onClose();
	};

	const toggleRepeat = () => {
		if (form.mode) {
			setForm({ mode: undefined, interval: undefined, unit: undefined, anchor: undefined });
		} else {
			setForm({ mode: "absolute", unit: "day", interval: 1, anchor: [] });
		}
	};

	return (
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit} class="flex flex-col gap-m">
				<section class="flex justify-between items-center">
					<ToggleSelect
						options={TYPES}
						selected={TYPES.indexOf(form.type)}
						onSelect={(i) => selectType(TYPES[i])}
					/>
					<Button type="submit">Save</Button>
				</section>
				<Input
					type="text"
					placeholder="Title"
					value={form.text}
					onInput={(text) => setForm({ text: text ?? "" })}
					class="text-lg font-medium"
					required
				/>
				<RichText placeholder="Notes" value={form.notes} onInput={(notes) => setForm({ notes })} />
				<hr class="text-[var(--border)]" />
				<section class="flex gap-m overflow-x-auto">
					<section class="flex gap-xs shrink-0">
						<DateInput date={form.date} setDate={(date) => date && setForm({ date })} />
						<Show when={form.type === "event"}>
							<TimeInput time={form.start!} setTime={(start) => setForm({ start })} />
							<TimeInput time={form.end!} setTime={(end) => setForm({ end })} />
						</Show>
					</section>
					<section class="flex gap-m shrink-0 ml-auto">
						<RepeatToggle mode={form.mode} onClick={() => toggleRepeat()} />
						<ProjectSelect
							projects={data.projects()}
							selected={form.projectId}
							onSelect={(projectId) => setForm({ projectId })}
						/>
					</section>
				</section>
				<Show when={form.mode && form.interval && form.unit && form.anchor}>
					<RepeatInputs
						modes={form.type === "event" ? MODES.slice(0, -1) : [...MODES]}
						mode={form.mode!}
						interval={form.interval!}
						unit={form.unit!}
						anchor={form.anchor!}
						onChange={(update) => setForm(update)}
					/>
				</Show>
			</form>
		</Modal>
	);
};

const buildForm = (
	props: Pick<Item, "type" | "date"> &
		Partial<Pick<Item, "text" | "notes">> & { projectId?: string },
) => ({
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
	projectId: props.projectId,
});

export default Create;
