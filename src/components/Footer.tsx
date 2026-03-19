import { useLocation } from "@solidjs/router";
import { useNavigateFromList, useNavigateToList } from "../lib/navigation";
import Button from "./Button";
import Icon from "./Icon";
import { Show } from "solid-js";
import { Transition } from "solid-transition-group";

const Footer = () => {
	const location = useLocation();
	const navigateFromList = useNavigateFromList();
	const navigateToList = useNavigateToList();
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname === "/create" ||
		location.pathname.startsWith("/edit/") ||
		location.pathname.startsWith("/notes/");

	return (
		<div class="flex justify-center gap-l p-s">
			<Transition name="footer" mode="outin">
				<Show
					when={showClose()}
					fallback={
						<div class="flex gap-l">
							<Button onClick={() => navigateFromList("/menu")}>
								<Icon>more_vert</Icon>
							</Button>
							<Button onClick={() => navigateFromList("/create")}>
								<Icon>playlist_add</Icon>
							</Button>
						</div>
					}
				>
					<Button onClick={navigateToList}>
						<Icon>close</Icon>
					</Button>
				</Show>
			</Transition>
		</div>
	);
};

export default Footer;
