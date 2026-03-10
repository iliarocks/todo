import { A } from "@solidjs/router";
import { Component, createSignal, ParentComponent, Show } from "solid-js";
import { db } from "./lib/db";
import Login from "./pages/Login";
import Button from "./components/Button";

const Layout: ParentComponent = (props) => {
	const [show, setShow] = createSignal(false);
	const auth = db.useAuth();

	const toggle = () => setShow(!show());

	return (
		<Show when={auth().user} fallback={<Login />}>
			<div class="flex flex-col h-dvh w-dvw gap-s p-s max-h-dvh md:w-[600px] md:m-auto">
				<main class="grow overflow-y-scroll">{props.children}</main>
				<Button class="relative text-3xl z-2" onClick={toggle}>
					· · ·
				</Button>
				<Show when={show()}>
					<div class="absolute inset-0 z-1 grid place-items-center bg-[var(--background)]">
						<Navigation onClose={() => setShow(false)} />
					</div>
				</Show>
			</div>
		</Show>
	);
};

const Navigation: Component<{ onClose: () => void }> = (props) => {
	return (
		<nav class="flex flex-col items-center gap-m">
			<A href="/" class="text-4xl" onClick={props.onClose}>
				Today
			</A>
			<A href="/upcoming" class="text-4xl" onClick={props.onClose}>
				Upcoming
			</A>
			<A href="/create" class="text-4xl" onClick={props.onClose}>
				Create
			</A>
			<Button onClick={() => db.auth.signOut()} class="text-[var(--secondary)]">
				Sign out
			</Button>
		</nav>
	);
};

export default Layout;
