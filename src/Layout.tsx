import { A } from "@solidjs/router";
import { ParentComponent, Show } from "solid-js";
import { db } from "./lib/db";
import Login from "./pages/Login";

const Layout: ParentComponent = (props) => {
	const auth = db.useAuth();

	return (
		<Show when={!auth().isLoading}>
			<Show when={auth().user} fallback={<Login />}>
				<div class="flex flex-col w-[500px] h-dvh gap-s p-s mx-auto">
					<main class="grow">{props.children}</main>
					<nav class="flex justify-between">
						<A href="/">Today</A>
						<A href="/upcoming">Upcoming</A>
						<A href="/create">Create</A>
						<button
							onClick={() => db.auth.signOut()}
							class="cursor-pointer text-[var(--secondary)]"
						>
							Sign out
						</button>
					</nav>
				</div>
			</Show>
		</Show>
	);
};

export default Layout;
