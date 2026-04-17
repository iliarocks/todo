import { Component, createEffect, onCleanup, onMount } from "solid-js";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const RichText: Component<{
	value: string | undefined;
	onInput: (value: string | undefined) => void;
	placeholder?: string;
}> = (props) => {
	let ref!: HTMLDivElement;
	let editor: Editor;

	onMount(() => {
		editor = new Editor({
			element: ref,
			extensions: [
				StarterKit.configure({
					blockquote: false,
					code: false,
					codeBlock: false,
					heading: false,
					horizontalRule: false,
					strike: false,
				}),
				...(props.placeholder
					? [Placeholder.configure({ placeholder: props.placeholder })]
					: []),
			],
			content: props.value ?? "",
			editorProps: {
				attributes: {
					class: "outline-none",
				},
			},
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				props.onInput(html || undefined);
			},
		});
	});

	onCleanup(() => editor?.destroy());

	createEffect(() => {
		if (editor && !editor.isFocused && props.value !== editor.getHTML()) {
			editor.commands.setContent(props.value ?? "");
		}
	});

	return <div ref={ref} />;
};

export default RichText;
