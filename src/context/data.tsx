import { Accessor, createContext, createMemo, ParentComponent, useContext } from "solid-js";
import { Item, parseItemWithTemplate, parseTemplateWithInstance, Template } from "../library/types";
import { useUser } from "./auth";
import { db } from "../library/db";

type Data = {
	items: Accessor<(Item & { template?: Template })[]>;
	templates: Accessor<(Template & { instance: Item })[]>;
};

const DataContext = createContext<Data>();

export const DataProvider: ParentComponent = (props) => {
	const user = useUser();
	const state = db.useQuery({
		items: { $: { where: { "user.id": user.id }, order: { order: "asc" } }, template: {} },
		templates: { $: { where: { "user.id": user.id } }, instance: {} },
	});

	const value = {
		items: createMemo(() => (state().data?.items ?? []).map(parseItemWithTemplate)),
		templates: createMemo(() => (state().data?.templates ?? []).flatMap((t) => {
			const parsed = parseTemplateWithInstance(t);
			return parsed ? [parsed] : [];
		})),
	};

	return <DataContext.Provider value={value}>{props.children}</DataContext.Provider>;
};

export const useData = () => {
	const data = useContext(DataContext);
	if (data === undefined) throw new Error("useData must be used within DataProvider");
	return data;
};
