import { type Component, createSignal, Match, Switch } from "solid-js";
import { db } from "../library/db";
import { Input, Button } from "../components/Input";

const Login: Component = () => {
	const [step, setStep] = createSignal<"email" | "code">("email");
	const [email, setEmail] = createSignal("");
	const [code, setCode] = createSignal("");

	const handleEmailSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		await db.auth.sendMagicCode({ email: email() });
		setStep("code");
	};

	const handleCodeSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		await db.auth.signInWithMagicCode({ email: email(), code: code() });
	};

	return (
		<main class="grid h-full w-full p-s place-items-center">
			<Switch>
				<Match when={step() === "email"}>
					<form onSubmit={handleEmailSubmit} class="flex flex-col w-full gap-l">
						<section class="flex flex-col gap-s">
							<h2 class="text-xl font-bold">Let's log you in</h2>
							<p class="text-[var(--secondary)]">
								Enter your email, and we'll send you a verification code.
							</p>
						</section>
						<section class="flex flex-col gap-s">
							<Input
								type="email"
								value={email()}
								onInput={(e) => setEmail(e)}
								autofocus
								surface
								required
							/>
							<Button type="submit">Send code</Button>
						</section>
					</form>
				</Match>
				<Match when={step() === "code"}>
					<form onSubmit={handleCodeSubmit} class="flex flex-col w-full gap-l">
						<section class="flex flex-col gap-s">
							<h2 class="text-xl font-bold">Enter your code</h2>
							<p class="text-[var(--secondary)]">Check your email, and paste the code you see.</p>
						</section>
						<section class="flex flex-col gap-s">
							<Input
								type="number"
								value={code()}
								onInput={(c) => setCode(c)}
								autofocus
								surface
								required
							/>
							<Button type="submit">Sign in</Button>
						</section>
					</form>
				</Match>
			</Switch>
		</main>
	);
};

export default Login;
