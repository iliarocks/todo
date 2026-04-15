import { Temporal } from "temporal-polyfill";
import { Component, Show } from "solid-js";
import { Item, Template } from "../library/types";
import Icon from "./Icon";
import { useNavigation } from "../library/navigation";
import { deleteItem } from "../library/db";

const format = (t: Temporal.PlainTime) =>
	t.round({ smallestUnit: "minute" }).toString().slice(0, 5);

const ListItem: Component<{
	item: Item & { template?: Template };
	virtual?: boolean;
	onPointerDown?: (e: PointerEvent) => void;
}> = (props) => {
	const navigation = useNavigation();
	const item = () => props.item;
	const virtual = () => props.virtual ?? false;

	return (
		<li
			onClick={() => navigation.push(`/notes/${item().id}`)}
			onPointerDown={props.onPointerDown}
			class="flex items-center justify-between p-xs rounded-md cursor-pointer active:bg-[var(--accent)] touch-none select-none"
		>
			<p>{item().text}</p>
			<div class="flex gap-s items-center">
				<Show when={item().type === "event" && item().start && item().end}>
					<p class="text-[var(--secondary)] text-xs font-light">
						{format(item().start!)} – {format(item().end!)}
					</p>
				</Show>
				<Show when={item().type === "todo" && !virtual()}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							deleteItem(item());
						}}
						onPointerDown={(e) => e.stopPropagation()}
						class="flex text-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer"
					>
						<Icon size={15}>check_box_outline_blank</Icon>
					</button>
				</Show>
				<Show when={virtual()}>
					<Icon size={15}>repeat</Icon>
				</Show>
			</div>
		</li>
	);
};

export default ListItem;
