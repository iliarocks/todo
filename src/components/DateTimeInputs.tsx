import { Component, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import Input from "./Input";
import { parseDate, parseTime, today } from "../library/date";

const DateTimeInputs: Component<{
	date: Temporal.PlainDate;
	end: Temporal.PlainTime | undefined;
	start: Temporal.PlainTime | undefined;
	setDate: (date: Temporal.PlainDate) => void;
	setStart: (start: Temporal.PlainTime | undefined) => void;
	setEnd: (end: Temporal.PlainTime | undefined) => void;
	time?: boolean;
}> = (props) => {
	return (
		<div class="flex gap-xs">
			<Input
				type="date"
				value={props.date.toString()}
				min={today().toString()}
				onInput={(e) => props.setDate(parseDate(e.currentTarget.value))}
				required
			/>
			<Show when={props.time}>
				<Input
					type="time"
					value={props.start?.toString() ?? ""}
					onInput={(e) => {
						const value = e.currentTarget.value;
						props.setStart(value ? parseTime(value) : undefined);
					}}
				/>
				<Input
					type="time"
					value={props.end?.toString() ?? ""}
					onInput={(e) => {
						const value = e.currentTarget.value;
						props.setEnd(value ? parseTime(value) : undefined);
					}}
				/>
			</Show>
		</div>
	);
};

export default DateTimeInputs;
