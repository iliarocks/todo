import { A, useLocation, useNavigate } from "@solidjs/router";
import { ParentComponent, Show, createEffect, on, onMount } from "solid-js";
import { inject } from "@vercel/analytics";
import { db } from "./lib/db";
import { reconcileEvents } from "./lib/mutations";
import { parseItemWithTemplate } from "./lib/types";
import { today } from "./lib/dates";
import Login from "./pages/Login";
import Icon from "./components/Icon";
import Button from "./components/Button";

const Layout: ParentComponent = (props) => {
	onMount(() => inject());
	const auth = db.useAuth();
	const location = useLocation();
	const isListPage = () => location.pathname === "/" || location.pathname === "/upcoming";

	const state = db.useQuery({
		items: {
			$: { where: { date: { $lte: today().add({ days: 1 }).toString() } } },
			template: {},
		},
	});
	const items = () => (state().data?.items ?? []).map(parseItemWithTemplate);

	createEffect(
		on(items, (is) => {
			const user = auth().user;

			if (user) {
				reconcileEvents(
					is.filter((i) => i.type === "event"),
					user,
				);
			}
		}),
	);

	return (
		<div class="h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					<div class="flex flex-col h-full w-full">
						<main class={`grow overflow-y-scroll py-m ${isListPage() ? "px-s" : "px-m"}`}>{props.children}</main>
						<Footer />
					</div>
				</Show>
			</Show>
		</div>
	);
};

const Footer = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname === "/create" ||
		location.pathname.startsWith("/edit/") ||
		location.pathname.startsWith("/notes/");

	return (
		<div class="flex justify-center gap-l p-s">
			<Show
				when={showClose()}
				fallback={
					<>
						<A href="/menu">
							<Icon>more_vert</Icon>
						</A>
						<A href="/create">
							<Icon>playlist_add</Icon>
						</A>
					</>
				}
			>
				<Button onClick={() => navigate(-1)}>
					<Icon>close</Icon>
				</Button>
			</Show>
		</div>
	);
};

export default Layout;
