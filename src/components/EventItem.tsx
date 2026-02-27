import { InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import schema from "../instant.schema";
import { format } from "date-fns";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const EventItem: Component<{ event: Item }> = (props) => {
	return (
		<div class="flex gap-l">
			<p>
				{format(props.event.date, "HH:mm")} · {props.event.text}
			</p>
		</div>
	);
};

export default EventItem;
