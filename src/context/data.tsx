import { Accessor, createContext, createEffect, ParentComponent, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { Item, parseItemTemplate, parseProject, parseTemplateInstance, parseVision, Project, Template, Vision } from "../library/types";
import { useUser } from "./auth";
import { db } from "../library/db";

type Items = (Item & { template?: Template })[];
type Templates = (Template & { instance: Item })[];
type Data = {
	items: Accessor<Items>;
	templates: Accessor<Templates>;
	vision: Accessor<Vision | undefined>;
	projects: Accessor<Project[]>;
};

const DataContext = createContext<Data>();

export const DataProvider: ParentComponent = (props) => {
	const user = useUser();
	const state = db.useQuery({
		items: { $: { where: { "user.id": user.id }, order: { order: "asc" } }, template: {} },
		templates: { $: { where: { "user.id": user.id } }, instance: {} },
		visions: { $: { where: { "user.id": user.id } }, reminder: {} },
		projects: { $: { where: { "user.id": user.id } }, items: {}, templates: { instance: {} } },
	});

	const [store, setStore] = createStore({
		items: [] as Items,
		templates: [] as Templates,
		vision: undefined as Vision | undefined,
		projects: [] as Project[],
	});

	createEffect(() => {
		setStore("items", reconcile((state().data?.items ?? []).map(parseItemTemplate)));
		setStore(
			"templates",
			reconcile(
				(state().data?.templates ?? []).flatMap((t) => {
					const parsed = parseTemplateInstance(t);
					return parsed ? [parsed] : [];
				}),
			),
		);
		const v = state().data?.visions?.[0];
		setStore("vision", v ? parseVision(v) : undefined);
		setStore("projects", reconcile((state().data?.projects ?? []).map(parseProject)));
	});

	const value = {
		items: () => store.items,
		templates: () => store.templates,
		vision: () => store.vision,
		projects: () => store.projects,
	};

	return <DataContext.Provider value={value}>{props.children}</DataContext.Provider>;
};

export const useData = () => {
	const data = useContext(DataContext);
	if (data === undefined) throw new Error("useData must be used within DataProvider");
	return data;
};
