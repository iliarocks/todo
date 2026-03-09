import { Component } from "solid-js";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const CycleButton: Component<{
	values: readonly string[];
	current: string;
	onChange: (value: string) => void;
}> = (props) => {
	const next = () => {
		const i = props.values.indexOf(props.current);
		props.onChange(props.values[(i + 1) % props.values.length]);
	};

	const longest = () => props.values.reduce((a, b) => (a.length >= b.length ? a : b));

	return (
		<button type="button" class="relative px-s py-xs cursor-pointer bg-[var(--tertiary)]" onClick={next}>
			<span class="invisible">{capitalize(longest())}</span>
			<span class="absolute inset-0 flex items-center justify-center">{capitalize(props.current)}</span>
		</button>
	);
};

export default CycleButton;
