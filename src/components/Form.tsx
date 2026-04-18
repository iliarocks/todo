import { Component, createEffect, For, JSX, onCleanup, onMount, Show, splitProps } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { compareDate, parseDate, parseTime, today } from "../library/date";
import { Mode, Project, Unit, UNITS } from "../library/types";
import Button from "./Button";

const WEEK_DAYS = ["m", "t", "w", "t", "f", "s", "s"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export const Input: Component<
	Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onInput"> & {
		value: string | undefined;
		onInput: (value: string | undefined) => void;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["value", "onInput", "class"]);

	return (
		<input
			{...others}
			class={`outline-none bg-transparent ${local.class}`}
			value={local.value ?? ""}
			onInput={(e) => local.onInput(e.currentTarget.value || undefined)}
		/>
	);
};

export const DateInput: Component<{
	date: Temporal.PlainDate | undefined;
	setDate: (date: Temporal.PlainDate | undefined) => void;
}> = (props) => {
	const formatDate = (date: Temporal.PlainDate) => {
		if (compareDate(date, today()) === 0) return "Today";

		return date.toLocaleString("en-US", { month: "long", day: "numeric" });
	};

	return (
		<span class="relative inline-block">
			{props.date ? formatDate(props.date) : "No date"}
			<Input
				type="date"
				value={props.date?.toString()}
				min={today().toString()}
				onInput={(d) => props.setDate(d ? parseDate(d) : undefined)}
				class="absolute inset-0 opacity-0 cursor-pointer appearance-none"
				required
			/>
		</span>
	);
};

export const TimeInput: Component<{
	time: Temporal.PlainTime | undefined;
	setTime: (time: Temporal.PlainTime | undefined) => void;
}> = (props) => {
	return (
		<Input
			type="time"
			value={props.time?.round({ smallestUnit: "minute" }).toString()}
			onInput={(t) =>props.setTime(t ? parseTime(t) : undefined)}
			class={`inline-block relative ${props.time ? "" : "text-[var(--secondary)]"}`}
		/>
	);
};

export const ProjectSelect: Component<{
	projects: Project[];
	selected: string | undefined;
	onSelect: (id: string | undefined) => void;
}> = (props) => {
	const name = () =>
		props.projects.find((p) => p.id === props.selected)?.name ?? "No project";

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
	mode: Mode | undefined;
	onClick: () => void;
}> = (props) => {
	const text = () => (props.mode ? "Repeat" : "No Repeat");

	return (
		<Button
			type="button"
			onClick={props.onClick}
			class={props.mode ? "" : "text-[var(--secondary)]"}
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

	return (
		<div class="flex flex-col gap-s">
			<Show when={props.modes.length > 1}>
				<ToggleSelect
					options={props.modes}
					selected={props.mode ? props.modes.indexOf(props.mode) : 0}
					onSelect={selectMode}
				/>
			</Show>
			<div class="flex items-center gap-xs">
				<span class="text-[var(--secondary)]">Every</span>
				<Input
					type="number"
					value={props.interval.toString()}
					onInput={(s) => props.onChange({ interval: s ? Number(s) : undefined })}
					class="w-12 text-center"
					required
				/>
				<div class="grow">
					<ToggleSelect
						options={UNITS}
						selected={UNITS.indexOf(props.unit)}
						onSelect={selectUnit}
					/>
				</div>
			</div>
			<Show when={props.anchor.length > 0}>
				<MultiToggleSelect
					options={props.unit === "week" ? WEEK_DAYS : MONTH_DAYS}
					selected={props.anchor}
					onSelect={(anchor) => props.onChange({ anchor })}
				/>
			</Show>
		</div>
	);
};

export const RichText: Component<{
	value: string | undefined;
	onInput: (value: string | undefined) => void;
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
			content: props.value ?? "",
			editorProps: {
				attributes: { class: "outline-none" },
			},
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				props.onInput(html || undefined);
			},
		});
	});

	onCleanup(() => editor?.destroy());

	createEffect(() => {
		if (editor && !editor.isFocused && props.value !== editor.getHTML()) {
			editor.commands.setContent(props.value ?? "");
		}
	});

	return <div ref={ref} />;
};

const ToggleBase: Component<{
	options: readonly string[];
	isSelected: (i: number) => boolean;
	onClick: (i: number) => void;
}> = (props) => {
	const borderRadius = (i: number) => {
		let classList = "rounded-md";
		if (props.isSelected(i - 1)) classList += " rounded-l-none";
		if (props.isSelected(i + 1)) classList += " rounded-r-none";
		return classList;
	};

	return (
		<div class="flex overflow-x-auto rounded-md bg-[var(--surface)]">
			<For each={props.options}>
				{(option, i) => (
					<button
						type="button"
						onClick={() => props.onClick(i())}
						class={`cursor-pointer shrink-0 grow px-s py-xs ${borderRadius(i())} ${props.isSelected(i()) ? "bg-[var(--border)]" : ""} md:px-m`}
					>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</button>
				)}
			</For>
		</div>
	);
};

export const ToggleSelect: Component<{
	options: readonly string[];
	selected: number;
	onSelect: (i: number) => void;
}> = (props) => (
	<ToggleBase
		options={props.options}
		isSelected={(i) => i === props.selected}
		onClick={(i) => props.onSelect(i)}
	/>
);

export const MultiToggleSelect: Component<{
	options: readonly string[];
	selected: number[];
	onSelect: (i: number[]) => void;
}> = (props) => (
	<ToggleBase
		options={props.options}
		isSelected={(i) => props.selected.includes(i)}
		onClick={(i) => {
			const next = props.selected.includes(i)
				? props.selected.filter((s) => s !== i)
				: [...props.selected, i];
			if (next.length > 0) props.onSelect(next);
		}}
	/>
);
