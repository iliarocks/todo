import { Component, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Item } from "../lib/types";
import { now } from "../lib/dates";

const fmt = (t: import("temporal-polyfill").Temporal.PlainTime) =>
	t.toString({ smallestUnit: "minute" });

const EventItem: Component<{ event: Item; onEdit?: () => void }> = (props) => {
	const navigate = useNavigate();
	const event = () => props.event;
	const isPast = () => {
		const e = event();
		const ref = e.end ?? e.start;
		return ref ? now().since(ref).sign > 0 : false;
	};

	return (
		<li
			onClick={() => props.onEdit ? props.onEdit() : navigate(`/edit/${event().id}`)}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--surface)]"
			classList={{ "opacity-40": isPast() }}
		>
			<p>{event().text}</p>
			<Show when={event().start}>
				{(start) => (
					<p class="text-[var(--secondary)] text-xs font-light font-[IBM_Plex_Mono]">
						{fmt(start())} – {event().end && fmt(event().end!)}
					</p>
				)}
			</Show>
		</li>
	);
};

export default EventItem;
