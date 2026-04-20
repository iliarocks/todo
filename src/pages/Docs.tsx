import { type Component } from "solid-js";
import { marked } from "marked";
import readme from "../../README.md?raw";

const html = marked.parse(readme) as string;

const Docs: Component = () => {
	return (
		<div class="flex flex-col gap-l">
			<div class="tiptap flex flex-col gap-s" innerHTML={html} />
		</div>
	);
};

export default Docs;
