import { InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import schema from "../instant.schema";
import { format } from "date-fns";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const EventItem: Component<{ event: Item }> = (props) => {
	const event = () => props.event;

	return (
		<li class="flex items-center justify-between px-xs py-xxs cursor-pointer">
			<p>{event().text}</p>
			<p class="text-[var(--secondary)] text-sm">
				{event().startTime!} - {event().endTime!}
			</p>
		</li>
	);
};

export default EventItem;
