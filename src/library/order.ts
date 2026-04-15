const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
const MID = CHARS[Math.floor(CHARS.length / 2)];

const midpoint = (a: string, b: string): string => {
	let prefix = "";

	for (let i = 0; i <= Math.max(a.length, b.length); i++) {
		const ai = i < a.length ? CHARS.indexOf(a[i]) : 0;
		const bi = i < b.length ? CHARS.indexOf(b[i]) : CHARS.length;

		if (ai + 1 < bi) {
			return prefix + CHARS[Math.floor((ai + bi) / 2)];
		}

		prefix += CHARS[ai];
	}

	return prefix + MID;
};

export const between = (before: string | undefined, after: string | undefined): string => {
	return midpoint(before ?? "", after ?? "");
};
