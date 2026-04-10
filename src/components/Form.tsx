import { Component, For, Show } from "solid-js";
import { JSX } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { parseDate, parseTime, today } from "../library/date";
import { Mode, Unit, UNITS } from "../library/types";

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => (
	<input class="p-s rounded-lg bg-[var(--surface)]" {...props} />
);

export const TextArea: Component<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
	<textarea
		class="p-s rounded-lg bg-[var(--surface)] resize-none field-sizing-content"
		{...props}
	/>
);

export const DateInput: Component<{
	date: Temporal.PlainDate;
	setDate: (date: Temporal.PlainDate) => void;
}> = (props) => {
	return (
		<Input
			type="date"
			value={props.date.toString()}
			min={today().toString()}
			onInput={(e) => props.setDate(parseDate(e.currentTarget.value))}
			required
		/>
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
			onInput={(e) => {
				const value = e.currentTarget.value;
				props.setTime(value ? parseTime(value) : undefined);
			}}
		/>
	);
};

export const RepeatInputs: Component<{
	modes: Mode[];
	mode: Mode | undefined;
	interval: number | undefined;
	unit: Unit | undefined;
	anchor: number[] | undefined;
	setMode: (mode: Mode | undefined) => void;
	setInterval: (interval: number | undefined) => void;
	setUnit: (unit: Unit | undefined) => void;
	setAnchor: (anchor: number[] | undefined) => void;
}> = (props) => {
	const WEEK_DAYS = ["m", "t", "w", "t", "f", "s", "s"];
	const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
	const options = () => ["none" as const, ...props.modes];

	const selectMode = (index: number) => {
		const value = options()[index];
		if (value === "none") {
			props.setMode(undefined);
			props.setInterval(undefined);
			props.setUnit(undefined);
			props.setAnchor(undefined);
		} else {
			props.setMode(value);
			props.setUnit("day");
			props.setInterval(1);
			props.setAnchor(value === "absolute" ? (props.unit === "day" ? [] : [0]) : undefined);
		}
	};

	const selectUnit = (index: number) => {
		const unit = UNITS[index];
		props.setUnit(unit);
		props.setAnchor(props.mode === "absolute" ? (unit === "day" ? [] : [0]) : undefined);
	};

	return (
		<div class="flex flex-col gap-s">
			<ToggleSelect
				options={options()}
				selected={props.mode ? options().indexOf(props.mode) : 0}
				onSelect={selectMode}
				single
			/>
			<Show when={props.mode}>
				<div class="flex items-center gap-xs">
					<span class="text-[var(--secondary)]">Every</span>
					<Input
						type="number"
						value={props.interval}
						onInput={(e) => props.setInterval(Number(e.currentTarget.value))}
						class="py-xs w-12 text-center"
						required
					/>
					<Show when={props.unit}>
						{(unit) => (
							<div class="grow">
								<ToggleSelect
									options={UNITS}
									selected={UNITS.indexOf(unit())}
									onSelect={selectUnit}
									single
								/>
							</div>
						)}
					</Show>
				</div>
			</Show>
			<Show when={props.anchor?.length ? props.anchor : undefined}>
				{(anchor) => (
					<ToggleSelect
						options={props.unit === "week" ? WEEK_DAYS : MONTH_DAYS}
						selected={anchor()}
						onSelect={props.setAnchor}
					/>
				)}
			</Show>
		</div>
	);
};

type ToggleSelectProps =
	| {
			options: readonly string[];
			selected: number;
			onSelect: (i: number) => void;
			single: true;
	  }
	| {
			options: readonly string[];
			selected: number[];
			onSelect: (i: number[]) => void;
			single?: false;
	  };

export const ToggleSelect: Component<ToggleSelectProps> = (props) => {
	const isSelected = (i: number) =>
		props.single ? props.selected === i : props.selected.includes(i);

	const handleClick = (i: number) => {
		if (props.single) props.onSelect(i);
		else {
			const next = isSelected(i) ? props.selected.filter((s) => s !== i) : [...props.selected, i];
			if (next.length > 0) props.onSelect(next);
		}
	};

	const borderRadius = (i: number) => {
		let classList = "rounded-md";

		if (isSelected(i - 1)) classList += " rounded-l-none";
		if (isSelected(i + 1)) classList += " rounded-r-none";

		return classList;
	};

	return (
		<div class="flex overflow-x-auto p-2xs rounded-md bg-[var(--surface)]">
			<For each={props.options}>
				{(option, i) => (
					<button
						type="button"
						onClick={() => handleClick(i())}
						class={`cursor-pointer shrink-0 grow px-s py-xs ${borderRadius(i())} ${isSelected(i()) ? "bg-[var(--border)]" : ""} md:px-m`}
					>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</button>
				)}
			</For>
		</div>
	);
};
