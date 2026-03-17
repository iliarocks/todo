import { ParentComponent } from "solid-js";

const Icon: ParentComponent<{ size?: number }> = (props) => {
	return (
		<span
			class="material-symbols-outlined"
			style={{ "font-size": `${props.size ?? 24}px`, color: "var(--secondary)" }}
		>
			{props.children}
		</span>
	);
};

export default Icon;
