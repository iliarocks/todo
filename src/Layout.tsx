import { A, useLocation, useNavigate } from "@solidjs/router";
import { ParentComponent, Show, onMount } from "solid-js";
import { inject } from "@vercel/analytics";
import { db } from "./lib/db";
import Login from "./pages/Login";
import Icon from "./components/Icon";
import Button from "./components/Button";

const Layout: ParentComponent = (props) => {
	onMount(() => inject());
	const auth = db.useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname === "/create" ||
		location.pathname.startsWith("/edit/");

	return (
		<div class="h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					<div class="flex flex-col gap-s py-s h-full w-full">
						<main class="grow px-s overflow-y-scroll">{props.children}</main>
						<div class="flex justify-center gap-l px-s">
						<Show when={showClose()}>
							<Button onClick={() => navigate(-1)}>
								<Icon>close</Icon>
							</Button>
						</Show>
						<Show when={!showClose()}>
							<A href="/menu">
								<Icon>more_vert</Icon>
							</A>
							<A href="/create">
								<Icon>playlist_add</Icon>
							</A>
							</Show>
						</div>
					</div>
				</Show>
			</Show>
		</div>
	);
};

export default Layout;
