import { Component, For } from "solid-js";

type SingleProps = {
	options: readonly string[];
	single: true;
	selected: number;
	onSelect: (index: number) => void;
};

type MultiProps = {
	options: readonly string[];
	single?: false;
	selected: number[];
	onSelect: (indices: number[]) => void;
};

const ToggleSelect: Component<SingleProps | MultiProps> = (props) => {
	const isSelected = (i: number) =>
		props.single ? props.selected === i : props.selected.includes(i);

	const handleClick = (i: number) => {
		if (props.single) props.onSelect(i);
		else {
			const next = isSelected(i) ? props.selected.filter((s) => s !== i) : [...props.selected, i];
			if (next.length > 0) props.onSelect(next);
		}
	};

	const borderRadius = (i: number) => {
		let classList = "rounded-md";

		if (isSelected(i - 1)) classList += " rounded-l-none";
		if (isSelected(i + 1)) classList += " rounded-r-none";

		return classList;
	};

	return (
		<div class="flex overflow-x-auto p-2xs rounded-md bg-[var(--surface)]">
			<For each={props.options}>
				{(option, i) => (
					<button
						type="button"
						onClick={() => handleClick(i())}
						class={`cursor-pointer shrink-0 grow px-s py-xs ${borderRadius(i())} ${isSelected(i()) ? "bg-[var(--border)]" : ""} md:px-m`}
					>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</button>
				)}
			</For>
		</div>
	);
};

export default ToggleSelect;
