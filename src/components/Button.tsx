import { Component, JSX, splitProps } from "solid-js";

const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
	props,
) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<button class={`cursor-pointer ${local.class ?? ""}`} {...rest}>
			{local.children}
		</button>
	);
};

export default Button;
