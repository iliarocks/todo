import { type Component, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { createStore } from "solid-js/store";
import Button from "../components/Button";
import Input from "../components/Input";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { db } from "../lib/db";
import { deleteItem, skipInstance, updateInstance, updateItem } from "../lib/mutations";
import { parseItem, parseTemplate, today, now } from "../lib/dates";
import { FormState, ItemType, Mode, Unit } from "../lib/form";

const Edit: Component = () => {
	const params = useParams();
	const navigate = useNavigate();
	const auth = db.useAuth();

	const query = db.useQuery({
		items: { $: { where: { id: params.id } }, template: {} },
	});

	const rawItem = () => query().data?.items?.[0];
	const item = () => {
		const r = rawItem();
		return r ? parseItem(r) : undefined;
	};
	const template = () => {
		const r = rawItem();
		return r?.template ? parseTemplate(r.template) : undefined;
	};

	const [form, setForm] = createStore<FormState>({
		type: "todo",
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

	let initialized = false;
	const getItem = () => {
		const i = item();
		if (i && !initialized) {
			initialized = true;
			const t = template();
			setForm({
				type: i.type as ItemType,
				text: i.text,
				notes: i.notes ?? t?.notes ?? "",
				date: i.date,
				start: i.start,
				end: i.end,
				mode: (t?.mode as Mode) ?? "none",
				interval: t?.interval ?? 1,
				unit: (t?.unit as Unit) ?? "day",
				anchor: t?.anchor ?? "",
			});
		}
		return i;
	};

	const hasTemplate = () => !!template();

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const r = rawItem();
		if (!r) return;
		if (hasTemplate()) {
			updateInstance(r, form);
		} else {
			updateItem(r, form, undefined, auth().user!);
		}
		navigate(-1);
	};

	const handleDelete = () => {
		const i = item();
		if (!i) return;
		const t = template();
		if (t) {
			skipInstance(i, t, auth().user!);
		} else {
			deleteItem(i);
		}
		navigate(-1);
	};

	return (
		<Show when={getItem()} fallback={<p>Loading...</p>}>
			<form onSubmit={handleSubmit} class="flex flex-col gap-[24px]">
				<section class="flex justify-between items-center">
					<button
						type="button"
						onClick={handleDelete}
						class="text-sm text-red-400 hover:text-red-300 cursor-pointer"
					>
						Delete
					</button>
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
				<Show when={!hasTemplate()}>
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
				</Show>
			</form>
		</Show>
	);
};

export default Edit;
