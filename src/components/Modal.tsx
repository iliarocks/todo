import { ParentComponent } from "solid-js";
import { Portal } from "solid-js/web";

const Modal: ParentComponent<{ onClose: () => void }> = (props) => {
	return (
		<Portal>
			<div class="fixed inset-0 bg-black/20" onClick={props.onClose} />
			<div class="fixed top-0 left-0 right-0 md:w-[600px] md:mx-auto">
				<div class="bg-[var(--background)] p-m rounded-b-md" onClick={(e) => e.stopPropagation()}>
					{props.children}
				</div>
			</div>
		</Portal>
	);
};

export default Modal;
