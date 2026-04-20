import { type Component, For } from "solid-js";
import { useData } from "../context/data";
import Empty from "../components/Empty";
import ListItem from "../components/ListItem";
import { TransitionGroup } from "solid-transition-group";
import { listTransition } from "../library/transitions";
import { createDragReorder } from "../library/drag";
import { updateItem } from "../library/db";
import { compareDate, today } from "../library/date";

const Today: Component = () => {
	const data = useData();
	const items = () => data.items().filter((i) => compareDate(i.date, today()) === 0);
	const onDrag = createDragReorder(items, (item, order) => updateItem(item, { order }));

	return (
		<div class="h-full flex flex-col justify-center">
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
