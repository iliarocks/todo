import { useLocation } from "@solidjs/router";
import { useNavigation } from "../library/navigation";
import IconButton from "./IconButton";
import { Show } from "solid-js";
import { Transition } from "solid-transition-group";

const Footer = () => {
	const location = useLocation();
	const navigation = useNavigation();
	const showClose = () =>
		location.pathname === "/menu" ||
		location.pathname === "/create" ||
		location.pathname.startsWith("/edit/") ||
		location.pathname.startsWith("/notes/");

	return (
		<div class="flex justify-center gap-l">
			<Transition name="footer" mode="outin">
				<Show
					when={showClose()}
					fallback={
						<div class="flex gap-l">
							<IconButton onClick={() => navigation.push("/menu")}>more_vert</IconButton>
							<IconButton onClick={() => navigation.push("/create")}>playlist_add</IconButton>
						</div>
					}
				>
					<IconButton onClick={navigation.back}>close</IconButton>
				</Show>
			</Transition>
		</div>
	);
};

export default Footer;
