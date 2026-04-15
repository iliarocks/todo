import { Accessor, createContext, createEffect, ParentComponent, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { Item, parseItemTemplate, parseTemplateInstance, Template } from "../library/types";
import { useUser } from "./auth";
import { db } from "../library/db";

type Items = (Item & { template?: Template })[];
type Templates = (Template & { instance: Item })[];
type Data = {
	items: Accessor<Items>;
	templates: Accessor<Templates>;
};

const DataContext = createContext<Data>();

export const DataProvider: ParentComponent = (props) => {
	const user = useUser();
	const state = db.useQuery({
		items: { $: { where: { "user.id": user.id }, order: { order: "asc" } }, template: {} },
		templates: { $: { where: { "user.id": user.id } }, instance: {} },
	});

	const [store, setStore] = createStore({
		items: [] as Items,
		templates: [] as Templates,
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
	});

	const value = {
		items: () => store.items,
		templates: () => store.templates,
	};

	return <DataContext.Provider value={value}>{props.children}</DataContext.Provider>;
};

export const useData = () => {
	const data = useContext(DataContext);
	if (data === undefined) throw new Error("useData must be used within DataProvider");
	return data;
};
