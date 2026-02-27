import { Component, JSX, splitProps } from "solid-js";

const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<input class={`p-xs bg-[var(--tertiary)] ${local.class ?? ""}`} {...rest} />
	);
};

export default Input;
