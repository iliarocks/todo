import { Temporal } from "temporal-polyfill";
import { Component, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Event } from "../lib/types";

const format = (t: Temporal.PlainTime) =>
	t.round({ smallestUnit: "minute" }).toString().slice(0, 5);

const EventItem: Component<{ event: Event; virtual?: boolean }> = (props) => {
	const navigate = useNavigate();
	const event = () => props.event;
	const virtual = () => props.virtual ?? false;

	return (
		<li
			onClick={() => navigate(`/notes/${virtual() ? "template" : "instance"}/${event().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
		>
			<p>{event().text}</p>
			<Show when={event().start && event().end}>
				<p class="text-[var(--secondary)] text-xs font-light font-[IBM_Plex_Mono]">
					{format(event().start!)} – {format(event().end!)}
				</p>
			</Show>
		</li>
	);
};

export default EventItem;
