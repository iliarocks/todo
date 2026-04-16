import { A } from "@solidjs/router";
import { Component } from "solid-js";
import { db } from "../library/db";
import Button from "../components/Button";

const Navigation: Component = () => {
	return (
		<nav class="flex flex-col items-center justify-center gap-m h-full w-full">
			<A href="/" class="text-4xl font-medium">
				Today
			</A>
			<A href="/upcoming" class="text-4xl font-medium">
				Upcoming
			</A>
			<A href="/vision" class="text-4xl font-medium">
				Vision
			</A>
			<Button onClick={() => db.auth.signOut()} class="text-[var(--secondary)]">
				Sign out
			</Button>
		</nav>
	);
};

export default Navigation;
