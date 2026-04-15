const collapsed = { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" };
const timing = { duration: 150, easing: "ease-out" };

export const fadeTransition = {
	onEnter(el: Element, done: () => void) {
		el.animate([{ opacity: 0 }, { opacity: 1 }], timing).onfinish = done;
	},
	onExit(el: Element, done: () => void) {
		el.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, fill: "forwards" }).onfinish = done;
	},
};

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
