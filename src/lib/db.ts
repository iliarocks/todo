import { init } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { today } from "./dates";

export const db = init({
	appId: import.meta.env.VITE_INSTANT_APP_ID!,
	schema,
});

export const queries = (userId: string) => ({
	expiring: {
		items: {
			$: { where: { date: { $lte: today().add({ days: 1 }).toString() }, "user.id": userId } },
			template: {},
		},
	} as const,
	lastOrder: {
		items: { $: { where: { "user.id": userId }, order: { order: "desc" }, limit: 1 } },
	} as const,
	itemById: (id: string) => ({
		items: { template: {}, $: { where: { id, "user.id": userId } } },
	} as const),
	templateById: (id: string) => ({
		templates: { instance: {}, $: { where: { id, "user.id": userId } } },
	} as const),
	today: {
		items: {
			$: { where: { date: { $lte: today().toString() }, "user.id": userId }, order: { order: "asc" } },
			template: {},
		},
	} as const,
	upcoming: {
		items: {
			$: { where: { date: { $gt: today().toString() }, "user.id": userId } },
			template: {},
		},
		templates: { $: { where: { "user.id": userId } }, instance: {} },
	} as const,
} as const);
