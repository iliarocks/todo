import { type Component, createSignal } from "solid-js";
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
		<div class="flex flex-col items-center justify-center h-full gap-s">
			{step() === "email" ? (
				<form onSubmit={handleEmailSubmit} class="flex flex-col gap-s w-full max-w-xs">
					<Input
						type="email"
						placeholder="Email"
						value={email()}
						onInput={(e) => setEmail(e.currentTarget.value)}
						required
					/>
					<Button type="submit">Send code</Button>
				</form>
			) : (
				<form onSubmit={handleCodeSubmit} class="flex flex-col gap-s w-full max-w-xs">
					<Input
						type="text"
						placeholder="Code"
						value={code()}
						onInput={(e) => setCode(e.currentTarget.value)}
						required
					/>
					<Button type="submit">Sign in</Button>
				</form>
			)}
		</div>
	);
};

export default Login;
