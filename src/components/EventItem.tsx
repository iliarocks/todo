import { InstaQLEntity } from "@instantdb/solidjs";
import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import schema from "../instant.schema";

type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;

const EventItem: Component<{ event: Item }> = (props) => {
	const navigate = useNavigate();
	const event = () => props.event;

	return (
		<li
			onClick={() => navigate(`/edit/${event().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
		>
			<p>{event().text}</p>
			<p class="text-[var(--secondary)] text-xs font-light font-[IBM_Plex_Mono]">
				{event().startTime!} - {event().endTime!}
			</p>
		</li>
	);
};

export default EventItem;
