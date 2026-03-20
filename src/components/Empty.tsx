import { Component } from "solid-js";

const Empty: Component = () => {
	return (
		<div class="grid place-items-center h-full w-full text-[var(--secondary)]">
			<h1>No tasks... for now</h1>
		</div>
	);
};

export default Empty;
