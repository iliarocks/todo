import { type Component, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import ListItem from "../components/ListItem";
import Empty from "../components/Empty";
import { useData } from "../context/data";
import { updateItem } from "../library/db";
import { compareDate, today } from "../library/date";
import { listTransition } from "../library/transitions";
import { createDragReorder } from "../library/drag";

const Today: Component = () => {
	const data = useData();
	const items = () => data.items().filter((item) => compareDate(item.date, today()) === 0);
	const onDrag = createDragReorder(items, (item, order) => updateItem(item, { order }));

	return (
		<div class="flex flex-col h-full justify-center">
			<ul>
				<TransitionGroup {...listTransition}>
					<For each={items()} fallback={<Empty />}>
						{(item) => <ListItem item={item} onPointerDown={onDrag(item)} />}
					</For>
				</TransitionGroup>
			</ul>
		</div>
	);
};

export default Today;
