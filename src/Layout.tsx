import { inject } from "@vercel/analytics";
import { onMount, ParentComponent, Show } from "solid-js";
import { db } from "./library/db";
import { AuthProvider } from "./context/auth";
import { DataProvider } from "./context/data";
import Login from "./pages/Login";
import { Transition } from "solid-transition-group";
import { fadeTransition } from "./library/transitions";
import Footer from "./components/Footer";
import Cleanup from "./components/Cleanup";

const Layout: ParentComponent = (props) => {
	onMount(() => inject());

	const auth = db.useAuth();

	return (
		<div class="relative h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					{(user) => (
						<AuthProvider user={user()}>
							<DataProvider>
								<main class="h-full w-full px-s pt-m pb-3xl overflow-y-scroll">
									<Transition {...fadeTransition} mode="outin">
										{props.children}
									</Transition>
								</main>
								<Footer />
								<Cleanup />
							</DataProvider>
						</AuthProvider>
					)}
				</Show>
			</Show>
		</div>
	);
};

export default Layout;
