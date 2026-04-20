import { Component } from "solid-js";
import Modal from "./Modal";
import { db } from "../library/db";
import { Button } from "./Input";
import { useNavigation } from "../library/navigation";

const Settings: Component<{ onClose: () => void }> = (props) => {
	const navigation = useNavigation();

	const openDocs = () => {
		props.onClose();
		navigation.push("/docs");
	};

	return (
		<Modal onClose={props.onClose}>
			<div class="flex justify-between">
				<Button onClick={openDocs} class="text-[var(--secondary)]">
					Docs
				</Button>
				<Button onClick={() => db.auth.signOut()} class="text-[var(--secondary)]">
					Sign out
				</Button>
			</div>
		</Modal>
	);
};

export default Settings;
