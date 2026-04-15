import { Item } from "./types";
import { between } from "./order";

type DragState = {
	item: Item;
	index: number;
	slot: number;
	element: HTMLElement;
	children: HTMLElement[];
	startY: number;
	centerOffset: number;
	rects: DOMRect[];
	active: boolean;
};

const findSlot = (pointerY: number, rects: DOMRect[]): number => {
	const i = rects.findIndex((r) => pointerY < r.top + r.height / 2);
	return i < 0 ? rects.length : i;
};

export const createDragReorder = (
	items: () => Item[],
	onReorder: (item: Item, newOrder: string) => void,
) => {
	let drag: DragState | undefined;

	const shiftSiblings = () => {
		if (!drag) return;
		const { children, index, slot, rects } = drag;
		const height = rects[index].height;

		for (let i = 0; i < children.length; i++) {
			if (i === index) continue;

			let dy = 0;
			if (slot < index && i >= slot && i < index) dy = height;
			else if (slot > index + 1 && i > index && i < slot) dy = -height;

			children[i].style.transform = dy ? `translateY(${dy}px)` : "";
		}
	};

	const onPointerMove = (e: PointerEvent) => {
		if (drag === undefined) return;

		const dy = e.clientY - drag.startY;

		if (!drag.active) {
			if (Math.abs(dy) < 5) return;
			drag.active = true;
			drag.element.style.zIndex = "10";
			drag.element.style.backgroundColor = "var(--accent)";
			for (const child of drag.children) {
				if (child !== drag.element) {
					child.style.transition = "transform 150ms ease";
				}
			}
		}

		drag.element.style.transform = `translateY(${dy}px)`;

		const slot = findSlot(e.clientY - drag.centerOffset, drag.rects);
		if (slot !== drag.slot) {
			drag.slot = slot;
			shiftSiblings();
		}
	};

	const onPointerUp = (e: PointerEvent) => {
		if (drag === undefined) return;

		const { element, children, active, index, slot, item } = drag;

		element.removeEventListener("pointermove", onPointerMove);
		element.removeEventListener("pointerup", onPointerUp);
		element.style.transform = "";
		element.style.zIndex = "";
		element.style.backgroundColor = "";

		for (const child of children) {
			if (child !== element) {
				child.style.transform = "";
				child.style.transition = "";
			}
		}

		if (active) {
			const parent = element.parentElement!;
			const suppress = (e: Event) => {
				e.stopPropagation();
				e.preventDefault();
				done();
			};
			const done = () => parent.removeEventListener("click", suppress, true);
			parent.addEventListener("click", suppress, true);
			setTimeout(done, 300);

			if (slot !== index && slot !== index + 1) {
				const list = items();
				const others = list.filter((_, i) => i !== index);
				const insertAt = slot > index ? slot - 1 : slot;
				const before = insertAt > 0 ? others[insertAt - 1].order : undefined;
				const after = insertAt < others.length ? others[insertAt].order : undefined;
				onReorder(item, between(before, after));
			}
		}

		drag = undefined;
	};

	return (item: Item) => (e: PointerEvent) => {
		if (e.button !== 0) return;
		const element = (e.target as HTMLElement).closest("li") as HTMLElement;
		if (!element) return;

		const parent = element.parentElement!;
		const children = [...parent.children] as HTMLElement[];
		const index = children.indexOf(element);

		element.setPointerCapture(e.pointerId);
		element.addEventListener("pointermove", onPointerMove);
		element.addEventListener("pointerup", onPointerUp);

		const rects = children.map((c) => c.getBoundingClientRect());

		drag = {
			item,
			index,
			slot: index,
			element,
			children,
			startY: e.clientY,
			centerOffset: e.clientY - (rects[index].top + rects[index].height / 2),
			rects,
			active: false,
		};
	};
};
