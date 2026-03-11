import { InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import schema from "../instant.schema";
import { format } from "date-fns";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const EventItem: Component<{ event: Item }> = (props) => {
	const event = () => props.event;

	return (
		<li class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]">
			<p>{event().text}</p>
			<p class="text-[var(--secondary)] text-xs font-light font-[IBM_Plex_Mono]">
				{event().startTime!} - {event().endTime!}
			</p>
		</li>
	);
};

export default EventItem;
