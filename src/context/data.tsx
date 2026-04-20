import { Accessor, createContext, createEffect, ParentComponent, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import {
	Item,
	parseItem,
	parseVision,
	Group,
	Template,
	Vision,
	parseGroup,
	parseTemplates,
} from "../library/types";
import { useUser } from "./auth";
import { db } from "../library/db";

type Data = {
	items: Accessor<Item[]>;
	templates: Accessor<Template[]>;
	vision: Accessor<Vision | undefined>;
	groups: Accessor<Group[]>;
};

const DataContext = createContext<Data>();

export const DataProvider: ParentComponent = (props) => {
	const user = useUser();
	const scope = { where: { "user.id": user.id } };
	const state = db.useQuery({
		items: {
			$: { ...scope, order: { order: "asc" } },
			template: {},
			group: {},
		},
		templates: { $: scope, instance: {}, group: {} },
		visions: { $: scope, reminder: {} },
		groups: { $: scope, items: {}, templates: {} },
	});

	const [store, setStore] = createStore({
		items: [] as Item[],
		templates: [] as Template[],
		groups: [] as Group[],
		vision: undefined as Vision | undefined,
	});

	createEffect(() => {
		setStore("items", reconcile((state().data?.items ?? []).map(parseItem)));
		setStore("templates", reconcile(parseTemplates(state().data?.templates ?? [])));
		setStore("groups", reconcile((state().data?.groups ?? []).map(parseGroup)));

		const vision = state().data?.visions?.[0];
		setStore("vision", vision ? parseVision(vision) : undefined);
	});

	const value = {
		items: () => store.items,
		templates: () => store.templates,
		groups: () => store.groups,
		vision: () => store.vision,
	} satisfies Data;

	return <DataContext.Provider value={value}>{props.children}</DataContext.Provider>;
};

export const useData = () => {
	const data = useContext(DataContext);
	if (data === undefined) throw new Error("useData must be used within DataProvider");
	return data;
};
