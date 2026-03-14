import { type Component, createSignal, Match, Switch } from "solid-js";
import { db } from "../lib/db";
import Input from "../components/Input";
import Button from "../components/Button";

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
					<form onSubmit={handleEmailSubmit} class="flex flex-col w-full gap-s">
						<Input
							autofocus
							type="email"
							placeholder="Email"
							value={email()}
							onInput={(e) => setEmail(e.currentTarget.value)}
							required
						/>
						<Button type="submit">Send code</Button>
					</form>
				</Match>
				<Match when={step() === "code"}>
					<form onSubmit={handleCodeSubmit} class="flex flex-col w-full gap-s">
						<Input
							autofocus
							type="text"
							placeholder="Code"
							value={code()}
							onInput={(e) => setCode(e.currentTarget.value)}
							required
						/>
						<Button type="submit">Sign in</Button>
					</form>
				</Match>
			</Switch>
		</main>
	);
};

export default Login;
