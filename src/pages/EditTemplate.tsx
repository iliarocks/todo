import { type Component, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { Temporal } from "temporal-polyfill";
import { createStore } from "solid-js/store";
import Button from "../components/Button";
import Input from "../components/Input";
import RepeatInputs from "../components/RepeatInputs";
import { db } from "../lib/db";
import { deleteTemplate, updateTemplate } from "../lib/mutations";
import { parseTemplate, toTime } from "../lib/dates";
import { FormState, ItemType, Mode, Unit } from "../lib/form";

const EditTemplate: Component = () => {
	const params = useParams();
	const navigate = useNavigate();

	const query = db.useQuery({
		templates: { $: { where: { id: params.id } } },
	});

	const rawTemplate = () => query().data?.templates?.[0];
	const template = () => {
		const r = rawTemplate();
		return r ? parseTemplate(r) : undefined;
	};

	const [form, setForm] = createStore<FormState>({
		type: "todo",
		text: "",
		notes: "",
		date: Temporal.Now.plainDateISO(),
		mode: "none",
		interval: 1,
		unit: "day",
		anchor: "",
	});

	let initialized = false;
	const getTemplate = () => {
		const t = template();
		if (t && !initialized) {
			initialized = true;
			setForm({
				type: t.type as ItemType,
				text: t.text,
				notes: t.notes ?? "",
				start: t.start,
				end: t.end,
				mode: t.mode as Mode,
				interval: t.interval,
				unit: t.unit as Unit,
				anchor: t.anchor,
			});
		}
		return t;
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const r = rawTemplate();
		if (!r) return;
		updateTemplate(r, form);
		navigate(-1);
	};

	const handleDelete = () => {
		const t = template();
		if (!t) return;
		deleteTemplate(t);
		navigate(-1);
	};

	return (
		<Show when={getTemplate()} fallback={<p>Loading...</p>}>
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
				<Show when={form.type === "event"}>
					<section class="flex flex-col gap-xs">
						<p class="text-xs text-[var(--secondary)]">WHEN</p>
						<div class="flex gap-xs">
							<Input
								type="time"
								value={form.start?.toString() ?? ""}
								onInput={(e) => {
									const value = e.currentTarget.value;
									setForm({ start: value ? toTime(value) : undefined });
								}}
							/>
							<Input
								type="time"
								value={form.end?.toString() ?? ""}
								onInput={(e) => {
									const value = e.currentTarget.value;
									setForm({ end: value ? toTime(value) : undefined });
								}}
							/>
						</div>
					</section>
				</Show>
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
		</Show>
	);
};

export default EditTemplate;
