import { Component, createEffect, createSignal, For, JSX, onCleanup, onMount, Show, splitProps } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Mode, Group, Unit, UNITS } from "../library/types";
import { autofocus } from "@solid-primitives/autofocus";
import { parseDate, parseTime, today } from "../library/date";
autofocus;

const WEEK_DAYS = ["m", "t", "w", "t", "f", "s", "s"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export const Input: Component<
	Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onInput"> & {
		value: string;
		onInput: (value: string) => void;
		surface?: boolean;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["value", "onInput", "class", "surface"]);

	return (
		<input
			{...others}
			use:autofocus
			class={`${local.surface ? "p-s rounded-lg bg-[var(--surface)]" : "outline-none bg-transparent"} ${local.class}`}
			value={local.value}
			onInput={(e) => local.onInput(e.currentTarget.value)}
		/>
	);
};

export const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<button class={`cursor-pointer ${local.class ?? ""}`} {...others}>
			{local.children}
		</button>
	);
};

export const DateInput: Component<{
	date: Temporal.PlainDate | undefined;
	setDate: (date: Temporal.PlainDate | undefined) => void;
	required?: boolean;
}> = (props) => {
	const format = (date: Temporal.PlainDate) => {
		if (Temporal.PlainDate.compare(date, today()) === 0) return "Today";

		return date.toLocaleString("en-US", { month: "long", day: "numeric" });
	};

	return (
		<span class={`relative inline-block ${props.date ? "" : "text-[var(--secondary)]"}`}>
			{props.date ? format(props.date) : "No date"}
			<Input
				type="date"
				value={props.date?.toString() ?? ""}
				min={today().toString()}
				onInput={(d) => props.setDate(d ? parseDate(d) : undefined)}
				class="absolute inset-0 opacity-0 cursor-pointer appearance-none"
				required={props.required}
			/>
		</span>
	);
};

export const MonthInput: Component<{
	date: Temporal.PlainDate | undefined;
	setDate: (date: Temporal.PlainDate | undefined) => void;
	required?: boolean;
}> = (props) => {
	const format = (date: Temporal.PlainDate) =>
		date.toLocaleString("en-US", { month: "long", year: "numeric" });

	return (
		<span
			class={`relative inline-block ${props.date ? "" : "text-[var(--secondary)] underline decoration-dotted underline-offset-4"}`}
		>
			{props.date ? format(props.date) : "someday"}
			<Input
				type="date"
				value={props.date?.toString() ?? ""}
				min={today().toString()}
				onInput={(d) => props.setDate(d ? parseDate(d) : undefined)}
				class="absolute inset-0 opacity-0 cursor-pointer appearance-none"
				required={props.required}
			/>
		</span>
	);
};

export const TimeInput: Component<{
	time: Temporal.PlainTime | undefined;
	setTime: (time: Temporal.PlainTime | undefined) => void;
	required?: boolean;
}> = (props) => {
	return (
		<Input
			type="time"
			value={props.time?.toString().slice(0, 5) ?? ""}
			onInput={(t) => props.setTime(t ? parseTime(t) : undefined)}
			class={`inline-block relative ${props.time ? "" : "text-[var(--secondary)]"}`}
			required={props.required}
		/>
	);
};

export const GroupSelect: Component<{
	projects: Group[];
	selected: string | undefined;
	onSelect: (id: string | undefined) => void;
}> = (props) => {
	const name = () => props.projects.find((p) => p.id === props.selected)?.name ?? "No project";

	return (
		<span class={`relative inline-block ${props.selected ? "" : "text-[var(--secondary)]"}`}>
			{name()}
			<select
				class="absolute inset-0 opacity-0 cursor-pointer appearance-none"
				value={props.selected ?? ""}
				onChange={(e) => props.onSelect(e.currentTarget.value || undefined)}
			>
				<option value="">None</option>
				<For each={props.projects}>
					{(project) => <option value={project.id}>{project.name}</option>}
				</For>
			</select>
		</span>
	);
};

export const RepeatToggle: Component<{
	repeat: boolean;
	onClick: () => void;
}> = (props) => {
	const text = () => (props.repeat ? "Repeat" : "No Repeat");

	return (
		<Button
			type="button"
			onClick={props.onClick}
			class={props.repeat ? "" : "text-[var(--secondary)]"}
		>
			{text()}
		</Button>
	);
};

type RepeatUpdate = Partial<{
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: number[];
}>;

export const RepeatInputs: Component<{
	modes: Mode[];
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: number[];
	onChange: (update: RepeatUpdate) => void;
}> = (props) => {
	const selectMode = (index: number) => {
		const mode = props.modes[index];
		props.onChange({ mode, unit: "day", interval: 1, anchor: [] });
	};

	const selectUnit = (index: number) => {
		const unit = UNITS[index];
		const anchor = props.mode === "relative" || unit === "day" ? [] : [0];
		props.onChange({ unit, anchor });
	};

	const [draft, setDraft] = createSignal(props.interval.toString());
	createEffect(() => setDraft(props.interval.toString()));

	const handleInterval = (s: string) => {
		setDraft(s);
		const n = Number(s);
		if (s && Number.isFinite(n) && n > 0) props.onChange({ interval: n });
	};

	return (
		<div class="flex flex-col gap-s">
			<Show when={props.modes.length > 1}>
				<ToggleSelect
					options={props.modes}
					selected={props.mode ? props.modes.indexOf(props.mode) : 0}
					onClick={selectMode}
				/>
			</Show>
			<div class="flex items-center gap-xs">
				<span class="text-[var(--secondary)]">Every</span>
				<Input
					type="number"
					value={draft()}
					onInput={handleInterval}
					class="w-12 text-center"
					required
				/>
				<div class="grow">
					<ToggleSelect options={UNITS} selected={UNITS.indexOf(props.unit)} onClick={selectUnit} />
				</div>
			</div>
			<Show when={props.anchor.length > 0}>
				<ToggleSelect
					options={props.unit === "week" ? WEEK_DAYS : MONTH_DAYS}
					selected={props.anchor}
					onClick={(anchor) => props.onChange({ anchor })}
					multiple
				/>
			</Show>
		</div>
	);
};

export const RichInput: Component<{
	value: string;
	onInput: (value: string) => void;
	placeholder?: string;
}> = (props) => {
	let ref!: HTMLDivElement;
	let editor: Editor;

	onMount(() => {
		editor = new Editor({
			element: ref,
			extensions: [
				StarterKit.configure({
					blockquote: false,
					code: false,
					codeBlock: false,
					heading: false,
					horizontalRule: false,
					strike: false,
				}),
				...(props.placeholder ? [Placeholder.configure({ placeholder: props.placeholder })] : []),
			],
			content: props.value,
			editorProps: {
				attributes: { class: "outline-none" },
			},
			onUpdate: ({ editor }) => {
				props.onInput(editor.getHTML());
			},
		});
	});

	onCleanup(() => editor?.destroy());

	createEffect(() => {
		if (editor && !editor.isFocused && props.value !== editor.getHTML()) {
			editor.commands.setContent(props.value);
		}
	});

	return <div ref={ref} />;
};

type MultipleSelect = {
	options: readonly string[];
	selected: number[];
	onClick: (i: number[]) => void;
	multiple: true;
};

type SingleSelect = {
	options: readonly string[];
	selected: number;
	onClick: (i: number) => void;
	multiple?: false;
};

export const ToggleSelect: Component<MultipleSelect | SingleSelect> = (props) => {
	const isSelected = (i: number) =>
		props.multiple ? props.selected.includes(i) : i === props.selected;

	const borderRadius = (i: number) => {
		let classList = "rounded-md";
		if (isSelected(i - 1)) classList += " rounded-l-none";
		if (isSelected(i + 1)) classList += " rounded-r-none";
		return classList;
	};

	const handleSelect = (i: number) => {
		if (props.multiple) {
			const next = isSelected(i) ? props.selected.filter((s) => s !== i) : [...props.selected, i];
			if (next.length > 0) props.onClick(next);
		} else {
			props.onClick(i);
		}
	};

	return (
		<div class="flex p-2xs overflow-x-auto rounded-md bg-[var(--surface)]">
			<For each={props.options}>
				{(option, i) => (
					<Button
						type="button"
						onClick={() => handleSelect(i())}
						class={`shrink-0 grow px-s py-xs ${borderRadius(i())} ${isSelected(i()) ? "bg-[var(--accent)]" : ""}`}
					>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</Button>
				)}
			</For>
		</div>
	);
};
