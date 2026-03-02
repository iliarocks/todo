import { A } from "@solidjs/router";
import { ParentComponent } from "solid-js";

const Layout: ParentComponent = (props) => {
	return (
		<div class="flex flex-col w-[500px] h-dvh gap-s p-s mx-auto">
			<main class="grow">{props.children}</main>
			<nav class="flex justify-between">
				<A href="/">Today</A>
				<A href="/upcoming">Upcoming</A>
				<A href="/create">Create</A>
			</nav>
		</div>
	);
}

export default Layout;
