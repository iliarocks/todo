import { inject } from "@vercel/analytics";
import { onMount, ParentComponent, Show } from "solid-js";
import { db } from "./library/db";
import { AuthProvider } from "./context/auth";
import { DataProvider } from "./context/data";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import { Transition } from "solid-transition-group";
import Cleanup from "./components/Cleanup";

const Layout: ParentComponent = (props) => {
	onMount(() => inject());

	const auth = db.useAuth();

	return (
		<div class="h-dvh w-dvw md:w-[600px] md:m-auto">
			<Show when={!auth().isLoading}>
				<Show when={auth().user} fallback={<Login />}>
					{(user) => (
						<AuthProvider user={user()}>
							<DataProvider>
								<div class="flex flex-col h-full w-full py-m px-s gap-m">
									<main class="grow overflow-y-scroll">
										<Transition name="page" mode="outin">
											{props.children}
										</Transition>
									</main>
									<Footer />
								</div>
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
