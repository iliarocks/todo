import { Component, createSignal, Show } from "solid-js";
import { useNavigation } from "../library/navigation";
import Icon from "./Icon";
import { useLocation } from "@solidjs/router";
import Create from "./Create";
import Settings from "./Settings";
import { Button } from "./Input";

const Footer: Component = () => {
	const location = useLocation();
	const [createOpen, setCreateOpen] = createSignal(false);
	const [settingsOpen, setSettingsOpen] = createSignal(false);

	const showClose = () =>
		location.pathname.startsWith("/notes") ||
		location.pathname.startsWith("/docs") ||
		location.pathname.startsWith("/project");

	return (
		<>
			<footer class="absolute inset-x-0 bottom-0 flex px-m py-l justify-between items-center text-[var(--secondary)] bg-linear-to-t from-[var(--background)] to-transparent from-65%">
				<Show when={!showClose()} fallback={<Close />}>
					<Navigation />
					<section class="flex gap-m">
						<Button onClick={() => setCreateOpen(true)}>
							<Icon>playlist_add</Icon>
						</Button>
						<Button onClick={() => setSettingsOpen(true)}>
							<Icon>more_vert</Icon>
						</Button>
					</section>
				</Show>
			</footer>
			<Show when={settingsOpen()}>
				<Settings onClose={() => setSettingsOpen(false)} />
			</Show>
			<Show when={createOpen()}>
				<Create onClose={() => setCreateOpen(false)} />
			</Show>
		</>
	);
};

const Navigation: Component = () => {
	const navigation = useNavigation();
	const location = useLocation();
	const push = (path: string) => navigation.push(path);

	const matchPath = (path: string) => {
		if (location.pathname === path) return "text-[var(--primary)]";
	};

	return (
		<nav class="flex gap-m text-xs font-medium">
			<Button onClick={() => push("/")} class={matchPath("/")}>
				TODAY
			</Button>
			<Button onClick={() => push("/upcoming")} class={matchPath("/upcoming")}>
				UPCOMING
			</Button>
			<Button onClick={() => push("/vision")} class={matchPath("/vision")}>
				VISION
			</Button>
		</nav>
	);
};

const Close: Component = () => {
	const navigation = useNavigation();

	return (
		<Button onClick={navigation.back} class="flex justify-center w-full">
			<Icon>close</Icon>
		</Button>
	);
};

export default Footer;
