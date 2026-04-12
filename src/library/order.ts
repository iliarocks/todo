const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

const midpoint = (a: string, b: string): string => {
	let result = "";

	for (let i = 0; ; i++) {
		const ai = i < a.length ? CHARS.indexOf(a[i]) : 0;
		const bi = i < b.length ? CHARS.indexOf(b[i]) : CHARS.length;

		if (ai + 1 < bi) {
			return result + CHARS[Math.floor((ai + bi) / 2)];
		}

		result += CHARS[ai];
		if (ai < bi) b = "";
	}
};

export const between = (before: string | undefined, after: string | undefined): string => {
	return midpoint(before ?? "", after ?? "");
};
