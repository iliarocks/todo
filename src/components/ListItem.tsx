import { Component, Show } from "solid-js";
import { type Item } from "../library/types";
import { useNavigation } from "../library/navigation";
import Icon from "./Icon";
import { Temporal } from "temporal-polyfill";
import { deleteItem } from "../library/db";
import { Button } from "./Input";

const ListItem: Component<{
	item: Item;
	virtual?: boolean;
	onPointerDown?: (e: PointerEvent) => void;
}> = (props) => {
	const navigation = useNavigation();
	const item = () => props.item;
	const virtual = () => props.virtual ?? false;

	const formatTime = (time: Temporal.PlainTime) => {
		return time.toString().slice(0, 5);
	};

	return (
		<li
			onClick={() => navigation.push(`/notes/${item().id}`)}
			onPointerDown={props.onPointerDown}
			class="flex items-center justify-between p-xs rounded-md touch-none select-none cursor-pointer active:bg-[var(--accent)]"
		>
			<p>{item().text}</p>
			<section class="flex gap-xs items-center text-[var(--secondary)]">
				<Show when={item().type === "todo" && !virtual()}>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							deleteItem(item());
						}}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<Icon size={15}>checkbox</Icon>
					</Button>
				</Show>
				<Show when={item().start}>
					{(start) => (
						<p class="text-xs font-light">
							{formatTime(start())}
							<Show when={item().end}>{(end) => " - " + formatTime(end())}</Show>
						</p>
					)}
				</Show>
				<Show when={virtual()}>
					<Icon size={15}>repeat</Icon>
				</Show>
			</section>
		</li>
	);
};

export default ListItem;
