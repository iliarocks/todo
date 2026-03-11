import { type Component, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { format } from "date-fns";
import { createStore } from "solid-js/store";
import Button from "../components/Button";
import Input from "../components/Input";
import DateTimeInputs from "../components/DateTimeInputs";
import RepeatInputs from "../components/RepeatInputs";
import { db } from "../lib/db";
import { deleteItem, updateItem } from "../lib/mutations";
import { Item } from "../lib/types";
import { FormState, FormType, Mode, Unit } from "../lib/formTypes";

const itemToForm = (item: Item): FormState => {
	const t = item.template;
	return {
		type: item.type as FormType,
		text: item.text,
		date: format(new Date(item.date), "yyyy-MM-dd"),
		startTime: item.startTime ?? format(new Date(), "HH:mm"),
		endTime: item.endTime ?? format(new Date(), "HH:mm"),
		mode: (t?.mode as Mode) ?? "none",
		interval: t?.interval ?? 1,
		unit: (t?.unit as Unit) ?? "day",
		anchor: t?.anchor ?? "",
	};
};

const Edit: Component = () => {
	const params = useParams();
	const navigate = useNavigate();
	const auth = db.useAuth();

	const query = db.useQuery({
		items: { $: { where: { id: params.id } }, template: {} },
	});

	const item = () => query().data?.items?.[0] as Item | undefined;

	const [form, setForm] = createStore<FormState>({
		type: "todo",
		text: "",
		date: format(new Date(), "yyyy-MM-dd"),
		startTime: format(new Date(), "HH:mm"),
		endTime: format(new Date(), "HH:mm"),
		mode: "none",
		interval: 1,
		unit: "day",
		anchor: "",
	});

	// Initialize form when item loads
	let initialized = false;
	const getItem = () => {
		const i = item();
		if (i && !initialized) {
			initialized = true;
			const f = itemToForm(i);
			setForm(f);
		}
		return i;
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const i = item();
		if (!i) return;
		updateItem(i, form, auth().user!.id);
		navigate(-1);
	};

	const handleDelete = () => {
		const i = item();
		if (!i) return;
		deleteItem(i);
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
		</Show>
	);
};

export default Edit;
