import { ParentComponent, Show } from "solid-js";
import { Portal } from "solid-js/web";

const Modal: ParentComponent<{
	open: boolean;
	onClose: () => void;
}> = (props) => {
	return (
		<Show when={props.open}>
			<Portal>
				<div class="fixed inset-0 bg-black/10" onClick={props.onClose} />
				<div class="fixed bottom-0 left-0 right-0 md:w-[600px] md:mx-auto">
					<div class="bg-[var(--background)] p-m" onClick={(e) => e.stopPropagation()}>
						{props.children}
					</div>
				</div>
			</Portal>
		</Show>
	);
};

export default Modal;
