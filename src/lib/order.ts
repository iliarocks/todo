const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
const MID = CHARS[Math.floor(CHARS.length / 2)];

const midpoint = (a: string, b: string): string => {
	const maxLen = Math.max(a.length, b.length);

	for (let i = 0; i < maxLen; i++) {
		const ai = i < a.length ? CHARS.indexOf(a[i]) : 0;
		const bi = i < b.length ? CHARS.indexOf(b[i]) : CHARS.length;

		if (ai + 1 < bi) {
			const mid = Math.floor((ai + bi) / 2);
			return a.slice(0, i) + CHARS[mid];
		}
	}

	return a + MID;
};

export const between = (before: string | undefined, after: string | undefined): string => {
	return midpoint(before ?? "", after ?? "");
};
