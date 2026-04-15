const collapsed = { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" };
const timing = { duration: 150, easing: "ease-out" };

export const listTransition = {
	onEnter(el: Element, done: () => void) {
		const h = el as HTMLElement;
		h.style.overflow = "hidden";
		h.animate([collapsed, { height: `${h.offsetHeight}px`, opacity: 1 }], timing).onfinish = () => {
			h.style.overflow = "";
			done();
		};
	},
	onExit(el: Element, done: () => void) {
		const h = el as HTMLElement;
		h.style.overflow = "hidden";
		h.animate([{ height: `${h.offsetHeight}px`, opacity: 1 }, collapsed], {
			...timing,
			fill: "forwards",
		}).onfinish = done;
	},
};
