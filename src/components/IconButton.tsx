import { Component, JSX, splitProps } from "solid-js";
import Button from "./Button";
import Icon from "./Icon";

const IconButton: Component<
	{ children: string; size?: number } & JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const [local, rest] = splitProps(props, ["children", "size"]);

	return (
		<Button
			class="flex text-[var(--secondary)] hover:text-[var(--border)] transition-colors duration-150"
			{...rest}
		>
			<Icon size={local.size}>{local.children}</Icon>
		</Button>
	);
};

export default IconButton;
