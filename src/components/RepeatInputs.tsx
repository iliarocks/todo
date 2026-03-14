import { Component, Show } from "solid-js";
import Input from "./Input";
import ToggleSelect from "./ToggleButton";
import { Mode, MODES, UNITS, WEEK_DAYS, MONTH_DAYS, Unit, ItemType } from "../lib/form";

const RepeatInputs: Component<{
	type: ItemType;
	mode: Mode;
	interval: number;
	unit: Unit;
	anchor: string;
	setMode: (mode: Mode) => void;
	setInterval: (interval: number) => void;
	setUnit: (unit: Unit) => void;
	setAnchor: (anchor: string) => void;
}> = (props) => {
	const modes = () => (props.type === "event" ? MODES.slice(0, -1) : MODES);
	const anchorSelected = () => (props.anchor ? props.anchor.split(" ").map(Number) : [0]);
	const showAnchor = () => props.mode === "absolute" && props.unit !== "day";

	return (
		<div class="flex flex-col gap-s">
			<ToggleSelect
				options={modes()}
				selected={[modes().indexOf(props.mode)]}
				onSelect={([i]) => {
					const mode = modes()[i];
					props.setMode(mode);
					props.setAnchor(mode === "absolute" && props.unit !== "day" ? "0" : "");
				}}
				single
			/>
			<Show when={props.mode !== "none"}>
				<div class="flex items-center gap-xs">
					<span class="text-[var(--secondary)]">Every</span>
					<Input
						type="number"
						value={props.interval}
						onInput={(e) => props.setInterval(Number(e.currentTarget.value))}
						class="py-xs w-12 text-center"
						required
					/>
					<div class="grow">
						<ToggleSelect
							options={UNITS}
							selected={[UNITS.indexOf(props.unit as any)]}
							onSelect={([i]) => {
								const unit = UNITS[i];
								props.setUnit(unit);
								props.setAnchor(unit === "day" ? "" : "0");
							}}
							single
						/>
					</div>
				</div>
			</Show>
			<Show when={showAnchor()}>
				<ToggleSelect
					options={props.unit === "week" ? WEEK_DAYS : MONTH_DAYS}
					selected={anchorSelected()}
					onSelect={(indices) => props.setAnchor(indices.join(" "))}
					cols={props.unit === "month" ? 7 : undefined}
				/>
			</Show>
		</div>
	);
};

export default RepeatInputs;
