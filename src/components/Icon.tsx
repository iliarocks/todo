import { Component, JSX, splitProps } from "solid-js";

const Icon: Component<JSX.HTMLAttributes<HTMLSpanElement> & { size?: number }> = (props) => {
	const [local, rest] = splitProps(props, ["class", "size", "children"]);
	return (
		<span
			class={`material-symbols-outlined ${local.class ?? ""}`}
			style={{ "font-size": `${local.size ?? 24}px` }}
			{...rest}
		>
			{local.children}
		</span>
	);
};

export default Icon;
