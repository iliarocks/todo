import { Component, JSX, splitProps } from "solid-js";

type HTMLInputProps = JSX.InputHTMLAttributes<HTMLInputElement>;
type HTMLTextAreaProps = JSX.InputHTMLAttributes<HTMLTextAreaElement>;

type InputProps =
	| ({ multiline: true } & HTMLTextAreaProps)
	| ({ multiline?: false } & HTMLInputProps);

const Input: Component<InputProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "multiline"]);
	const styles = () => `p-s rounded-lg bg-[var(--surface)] ${local.class ?? ""}`;

	if (local.multiline) {
		return (
			<textarea
				class={styles() + "resize-none field-sizing-content"}
				{...(rest as HTMLTextAreaProps)}
			/>
		);
	}

	return <input class={styles()} {...(rest as HTMLInputProps)} />;
};

export default Input;
