import { A, useLocation, useParams } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { db, queries } from "../lib/db";
import { Item, parseItemWithTemplate, parseTemplate, Template } from "../lib/types";
import Button from "../components/Button";
import { marked } from "marked";


const Notes: Component = () => {
	const params = useParams<{ type: string; id: string }>();
	const location = useLocation();
	const isTemplate = () => params.type === "template";

	const auth = db.useAuth();
	const itemQuery = db.useQuery(() => {
		const user = auth().user;
		return user ? queries(user.id).itemById(params.id) : null;
	});
	const templateQuery = db.useQuery(() => {
		const user = auth().user;
		return user ? queries(user.id).templateById(params.id) : null;
	});

	const item = (): Item | Template | undefined => {
		if (isTemplate()) {
			const raw = templateQuery().data?.templates?.[0];
			if (!raw) return undefined;
			return parseTemplate(raw);
		}
		const raw = itemQuery().data?.items?.[0];
		if (!raw) return undefined;
		return parseItemWithTemplate(raw);
	};

	return (
		<Show when={item()}>
			{(data) => (
				<div class="flex flex-col gap-m h-full justify-center">
					<section class="flex justify-between text-[var(--secondary)]">
						<h1>{data().text}</h1>
						<Button><A href={`/edit/${params.type}/${params.id}`} state={{ origin: (location.state as any)?.origin }}>Edit</A></Button>
					</section>
					<Show when={data().notes}>{(notes) => <div innerHTML={marked.parse(notes()) as string} />}</Show>
				</div>
			)}
		</Show>
	);
};

export default Notes;
