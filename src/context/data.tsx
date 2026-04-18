import { Accessor, createContext, createEffect, ParentComponent, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import {
	Item,
	parseItem,
	parseProject,
	parseTemplate,
	parseVision,
	Project,
	Template,
	Vision,
} from "../library/types";
import { useUser } from "./auth";
import { db } from "../library/db";

type Data = {
	items: Accessor<Item[]>;
	templates: Accessor<Template[]>;
	vision: Accessor<Vision | undefined>;
	projects: Accessor<Project[]>;
};

const DataContext = createContext<Data>();

export const DataProvider: ParentComponent = (props) => {
	const user = useUser();
	const state = db.useQuery({
		items: {
			$: { where: { "user.id": user.id }, order: { order: "asc" } },
			template: {},
			project: {},
		},
		templates: { $: { where: { "user.id": user.id } }, instance: {}, project: {} },
		visions: { $: { where: { "user.id": user.id } }, reminder: {} },
		projects: {
			$: { where: { "user.id": user.id } },
			items: {},
			templates: { instance: {} },
		},
	});

	const [store, setStore] = createStore({
		items: [] as Item[],
		templates: [] as Template[],
		vision: undefined as Vision | undefined,
		projects: [] as Project[],
	});

	createEffect(() => {
		setStore("items", reconcile((state().data?.items ?? []).map(parseItem)));
		setStore(
			"templates",
			reconcile(
				(state().data?.templates ?? []).map(parseTemplate).filter((t) => t !== undefined)))

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
