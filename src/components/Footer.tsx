import { useLocation, useParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useNavigation } from "../library/navigation";
import IconButton from "./IconButton";
import { Show } from "solid-js";
import { Transition } from "solid-transition-group";
import { fadeTransition } from "../library/transitions";
import Create from "./Create";

const Footer = () => {
	const location = useLocation();
	const params = useParams();
	const navigation = useNavigation();
	const [createOpen, setCreateOpen] = createSignal(false);

	const isProject = () => location.pathname.startsWith("/project/");
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname.startsWith("/notes/") ||
		isProject();

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
						<div class="flex gap-l">
							<IconButton onClick={navigation.back}>close</IconButton>
							<Show when={isProject()}>
								<IconButton onClick={() => setCreateOpen(true)}>playlist_add</IconButton>
							</Show>
						</div>
					</Show>
				</Transition>
			</div>
			<Create
				open={createOpen()}
				onClose={() => setCreateOpen(false)}
				projectId={isProject() ? params.id : undefined}
			/>
		</>
	);
};

export default Footer;
