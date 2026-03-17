import { Temporal } from "temporal-polyfill";
import { useNavigate, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { db } from "../lib/db";
import { parseItem, parseTemplate, Item, Template } from "../lib/types";
import { EditParameters, updateItem, updateTemplate, deleteItem, deleteTemplate } from "../lib/mutations";
import Button from "../components/Button";
import Input from "../components/Input";
import DateTimeInputs from "../components/DateTimeInputs";

const toForm = (data: { text: string; date: Temporal.PlainDate; start?: Temporal.PlainTime; end?: Temporal.PlainTime; notes?: string }): EditParameters => ({
	text: data.text,
	date: data.date,
	start: data.start,
	end: data.end,
	notes: data.notes,
});

const Edit: Component = () => {
	const params = useParams<{ source: string; type: string; id: string }>();
	const navigate = useNavigate();
	const isTemplate = () => params.source === "template";

	const itemQuery = db.useQuery({ items: { template: {}, $: { where: { id: params.id } } } });
	const templateQuery = db.useQuery({
		templates: { instance: {}, $: { where: { id: params.id } } },
	});

	const loaded = () => {
		if (isTemplate()) {
			const raw = templateQuery().data?.templates?.[0];
			return raw ? parseTemplate(raw) : undefined;
		}
		const raw = itemQuery().data?.items?.[0];
		return raw ? parseItem(raw) : undefined;
	};

	const auth = db.useAuth();

	return (
		<Show when={loaded()}>
			{(data) => (
				<EditForm data={data()} isTemplate={isTemplate()} navigate={navigate} user={auth().user!} />
			)}
		</Show>
	);
};

const EditForm: Component<{
	data: Item | Template;
	isTemplate: boolean;
	navigate: (to: number | string) => void;
	user: { id: string };
}> = (props) => {
	const source = () => {
		if (props.isTemplate) {
			const t = props.data as Template;
			return { ...toForm({ ...t, date: t.instance!.date }), isEvent: t.instance!.type === "event" };
		}
		const item = props.data as Item;
		return { ...toForm(item), isEvent: item.type === "event" };
	};

	const [form, setForm] = createStore<EditParameters>(source());

	const handleDelete = () => {
		if (props.isTemplate) {
			deleteTemplate((props.data as Template).id);
		} else {
			deleteItem(props.data as Item, props.user);
		}
		props.navigate("/");
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (props.isTemplate) {
			const t = props.data as Template;
			updateTemplate(t.id, t.instance!.id, form);
		} else {
			const item = props.data as Item;
			updateItem(item.id, form, item.template?.id);
		}
		props.navigate(-1);
	};

	return (
		<form onSubmit={handleSubmit} class="flex flex-col gap-s">
			<section class="flex justify-between items-center">
				<Button onClick={handleDelete}>Delete</Button>
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
					time={source().isEvent}
				/>
			</section>
		</form>
	);
};

export default Edit;
