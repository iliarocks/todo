import { useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useNavigation } from "../library/navigation";
import IconButton from "./IconButton";
import { Show } from "solid-js";
import { Transition } from "solid-transition-group";
import { fadeTransition } from "../library/transitions";
import Create from "./Create";

const Footer = () => {
	const location = useLocation();
	const navigation = useNavigation();
	const [createOpen, setCreateOpen] = createSignal(false);
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname.startsWith("/notes/");

	return (
		<>
			<div class="flex justify-center gap-l">
				<Transition {...fadeTransition} mode="outin">
					<Show
						when={showClose()}
						fallback={
							<div class="flex gap-l">
								<IconButton onClick={() => navigation.push("/menu")}>more_vert</IconButton>
								<IconButton onClick={() => setCreateOpen(true)}>playlist_add</IconButton>
							</div>
						}
					>
						<IconButton onClick={navigation.back}>close</IconButton>
					</Show>
				</Transition>
			</div>
			<Create open={createOpen()} onClose={() => setCreateOpen(false)} />
		</>
	);
};

export default Footer;
