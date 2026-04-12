import { useLocation } from "@solidjs/router";
import { useNavigation } from "../library/navigation";
import Button from "./Button";
import Icon from "./Icon";
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
							<Button onClick={() => navigation.push("/menu")}>
								<Icon>more_vert</Icon>
							</Button>
							<Button onClick={() => navigation.push("/create")}>
								<Icon>playlist_add</Icon>
							</Button>
						</div>
					}
				>
					<Button onClick={navigation.back}>
						<Icon>close</Icon>
					</Button>
				</Show>
			</Transition>
		</div>
	);
};

export default Footer;
