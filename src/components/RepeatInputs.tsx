import { Component, Show } from "solid-js";
import Input from "./Input";
import ToggleSelect from "./ToggleSelect";
import { Mode, Unit, UNITS } from "../lib/types";

const WEEK_DAYS = ["m", "t", "w", "t", "f", "s", "s"] as const;
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const RepeatInputs: Component<{
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
			props.setAnchor(value === "absolute" ? (props.unit !== "day" ? [0] : []) : undefined);
		}
	};

	const selectUnit = (index: number) => {
		const unit = UNITS[index];
		props.setUnit(unit);
		props.setAnchor(props.mode === "absolute" ? (unit !== "day" ? [0] : []) : undefined);
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

export default RepeatInputs;
