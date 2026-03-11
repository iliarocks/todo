import { A, useLocation, useNavigate } from "@solidjs/router";
import { ParentComponent, Show } from "solid-js";
import { db } from "./lib/db";
import Login from "./pages/Login";
import Icon from "./components/Icon";

const Layout: ParentComponent = (props) => {
	const auth = db.useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const onMenuClick = () => {
		if (location.pathname === "/menu") navigate(-1);
		else navigate("/menu");
	};

	const onCreateClick = () => {
		if (location.pathname === "/create") navigate(-1);
		else navigate("/create");
	};

	return (
		<div class="h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					<div class="flex flex-col gap-s py-s h-full w-full">
						<main class="grow px-s overflow-y-scroll">{props.children}</main>
						<div class="flex justify-between px-s">
							<button class="cursor-pointer" onClick={onMenuClick}>
								<Icon>more_vert</Icon>
							</button>
							<button class="cursor-pointer" onClick={onCreateClick}>
								<Icon>playlist_add</Icon>
							</button>
						</div>
					</div>
				</Show>
			</Show>
		</div>
	);
};

export default Layout;
