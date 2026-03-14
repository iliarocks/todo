import { Component, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import Input from "./Input";
import { ItemType } from "../lib/form";
import { today } from "../lib/dates";

const DateTimeInputs: Component<{
	type: ItemType;
	date: Temporal.PlainDate;
	end: Temporal.PlainTime | undefined;
	start: Temporal.PlainTime | undefined;
	setDate: (date: Temporal.PlainDate) => void;
	setStart: (start: Temporal.PlainTime | undefined) => void;
	setEnd: (end: Temporal.PlainTime | undefined) => void;
}> = (props) => {
	return (
		<div class="flex gap-xs">
			<Input
				type="date"
				value={props.date.toString()}
				min={today().toString()}
				onInput={(e) => props.setDate(Temporal.PlainDate.from(e.currentTarget.value))}
				required
			/>
			<Show when={props.type === "event"}>
				<Input
					type="time"
					value={props.start?.toString() ?? ""}
					onInput={(e) => {
						const value = e.currentTarget.value;
						props.setStart(value ? Temporal.PlainTime.from(value) : undefined);
					}}
				/>
				<Input
					type="time"
					value={props.end?.toString() ?? ""}
					onInput={(e) => {
						const value = e.currentTarget.value;
						props.setEnd(value ? Temporal.PlainTime.from(value) : undefined);
					}}
				/>
			</Show>
		</div>
	);
};

export default DateTimeInputs;
