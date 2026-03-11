import { Component, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import Input from "./Input";
import { FormState } from "../lib/formTypes";

const DateTimeInputs: Component<{
	type: "todo" | "event";
	date: string;
	startTime: string;
	endTime: string;
	setForm: SetStoreFunction<FormState>;
}> = (props) => {
	const isEvent = () => props.type === "event";

	return (
		<div class="flex gap-xs">
			<Input
				type="date"
				value={props.date}
				onInput={(e) => props.setForm({ date: e.currentTarget.value })}
				required
			/>
			<Show when={isEvent()}>
				<Input
					type="time"
					value={props.startTime}
					onInput={(e) => props.setForm({ startTime: e.currentTarget.value })}
					required
				/>
				<Input
					type="time"
					value={props.endTime}
					onInput={(e) => props.setForm({ endTime: e.currentTarget.value })}
					required
				/>
			</Show>
		</div>
	);
};

export default DateTimeInputs;
