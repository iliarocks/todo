import { Component, For } from "solid-js";

const ToggleSelect: Component<{
	options: readonly string[];
	selected: number[];
	onSelect: (values: number[]) => void;
	single?: boolean;
	cols?: number;
}> = (props) => {
	const cols = () => props.cols ? props.cols : props.options.length;
	const isSelected = (i: number) => props.selected.includes(i);

	const handleClick = (i: number) => {
		if (props.single) props.onSelect([i]);
		else {
			const next = isSelected(i) ? props.selected.filter((s) => s !== i) : [...props.selected, i];
			if (next.length > 0) props.onSelect(next);
		}
	};

	const isMultiRow = () => !!props.cols && props.options.length > props.cols;
	const gridColumns = () => ({ "grid-template-columns": `repeat(${cols()}, 1fr)` });
	const borderRadius = (i: number) => {
		let classList = "rounded-md";

		if (isSelected(i - 1)) classList += " rounded-l-none";
		if (isSelected(i + 1)) classList += " rounded-r-none";
		if (isSelected(i - cols())) classList += " rounded-t-none";
		if (isSelected(i + cols())) classList += " rounded-b-none";

		return classList;
	};

	return (
		<div class="grid p-2xs rounded-md bg-[var(--surface)]" style={gridColumns()}>
			<For each={props.options}>
				{(option, i) => (
					<button
						type="button"
						onClick={() => handleClick(i())}
						class={`cursor-pointer px-s ${isMultiRow() ? "py-s" : "py-xs"} ${borderRadius(i())} ${isSelected(i()) ? "bg-[var(--border)]" : ""}`}
					>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</button>
				)}
			</For>
		</div>
	);
};

export default ToggleSelect;
