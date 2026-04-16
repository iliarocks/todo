import { type Component, createEffect, onCleanup, onMount } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import { createVision, updateVision, saveReminder } from "../library/db";
import { DateInput } from "../components/Form";
import { between } from "../library/order";

const Vision: Component = () => {
	const user = useUser();
	const data = useData();

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
			],
			editorProps: {
				attributes: {
					class: "p-s rounded-lg bg-[var(--surface)] outline-none",
				},
			},
			onUpdate: ({ editor }) => {
				saveText(editor.getHTML());
			},
		});
	});

	onCleanup(() => editor?.destroy());

	createEffect(() => {
		const vision = data.vision();
		if (vision && editor && !editor.isFocused) {
			editor.commands.setContent(vision.text);
		}
	});

	const saveText = (text: string) => {
		const vision = data.vision();
		if (vision) {
			updateVision(vision, text);
		} else if (text) {
			createVision(text, user);
		}
	};

	const saveHorizon = (date: Temporal.PlainDate | undefined) => {
		const vision = data.vision();
		if (!vision || !date) return;
		const order = between(data.items().at(-1)?.order, undefined);
		saveReminder(vision, date, order, user);
	};

	return (
		<div class="flex flex-col gap-m">
			<section class="flex justify-between items-center">
				<h1 class="text-xs text-[var(--secondary)]">VISION</h1>
				<DateInput
					date={data.vision()?.reminder?.date}
					setDate={saveHorizon}
				/>
			</section>
			<div ref={ref} />
		</div>
	);
};

export default Vision;
