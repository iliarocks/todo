import { type Component } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { useUser } from "../context/auth";
import { useData } from "../context/data";
import { createVision, updateVision, saveReminder } from "../library/db";
import { DateInput } from "../components/Form";
import { between } from "../library/order";
import RichText from "../components/RichText";

const Vision: Component = () => {
	const user = useUser();
	const data = useData();

	const saveText = (text: string | undefined) => {
		const vision = data.vision();
		if (vision) {
			updateVision(vision, text ?? "");
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
			<RichText
				placeholder="Write your vision..."
				value={data.vision()?.text}
				onInput={saveText}
			/>
		</div>
	);
};

export default Vision;
