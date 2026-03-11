import { Component, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import Input from "./Input";
import ToggleSelect from "./ToggleButton";
import { FormState, FormType, Mode, MODES, UNITS, WEEK_DAYS, MONTH_DAYS } from "../lib/formTypes";

const RepeatInputs: Component<{
	type: FormType;
	mode: Mode;
	interval: number;
	unit: string;
	anchor: string;
	setForm: SetStoreFunction<FormState>;
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
					props.setForm({ mode, anchor: mode === "absolute" && props.unit !== "day" ? "0" : "" });
				}}
				single
			/>
			<Show when={props.mode !== "none"}>
				<div class="flex items-center gap-xs">
					<span class="text-[var(--secondary)]">Every</span>
					<Input
						type="number"
						value={props.interval}
						onInput={(e) => props.setForm({ interval: Number(e.currentTarget.value) })}
						class="py-xs w-12 text-center"
						required
					/>
					<div class="grow">
						<ToggleSelect
							options={UNITS}
							selected={[UNITS.indexOf(props.unit as any)]}
							onSelect={([i]) => {
								const unit = UNITS[i];
								props.setForm({ unit, anchor: unit === "day" ? "" : "0" });
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
					onSelect={(indices) => props.setForm({ anchor: indices.join(" ") })}
					cols={props.unit === "month" ? 7 : undefined}
				/>
			</Show>
		</div>
	);
};

export default RepeatInputs;
