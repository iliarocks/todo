import { useLocation } from "@solidjs/router";
import { ParentComponent, Show, createEffect, on, onMount } from "solid-js";
import { inject } from "@vercel/analytics";
import { Temporal } from "temporal-polyfill";
import { db, queries } from "./lib/db";
import { deleteItem } from "./lib/mutations";
import { parseItemWithTemplate } from "./lib/types";
import { now, today } from "./lib/dates";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/auth";

const Layout: ParentComponent = (props) => {
	onMount(() => inject());
	const auth = db.useAuth();
	const location = useLocation();
	const isListPage = () => location.pathname === "/" || location.pathname === "/upcoming";

	const state = db.useQuery(() => {
		const user = auth().user;
		return user ? queries(user.id).expiring : null;
	});
	const items = () => (state().data?.items ?? []).map(parseItemWithTemplate);

	createEffect(
		on(items, (is) => {
			const user = auth().user;
			if (user) {
				const events = is.filter((i) => i.type === "event");
				const expired = events.filter(
					(e) =>
						Temporal.PlainDate.compare(e.date, today()) < 0 ||
						(Temporal.PlainDate.compare(e.date, today()) === 0 &&
							Temporal.PlainTime.compare(e.end ?? now(), now()) < 0),
				);
				for (const e of expired) deleteItem(e, user);
			}
		}),
	);

	return (
		<div class="h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					{(user) => (
						<AuthProvider user={user()}>
							<div class="flex flex-col h-full w-full">
								<main class={`grow overflow-y-scroll py-m ${isListPage() ? "px-s" : "px-m"}`}>
									{props.children}
								</main>
								<Footer />
							</div>
						</AuthProvider>
					)}
				</Show>
			</Show>
		</div>
	);
};

export default Layout;
