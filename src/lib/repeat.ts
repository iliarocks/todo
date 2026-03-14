import { Template } from "./types";
import { Temporal } from "temporal-polyfill";
import { advanceDate } from "./dates";

export const nextDate = (
	instanceDate: Temporal.PlainDate,
	template: Template,
): Temporal.PlainDate => {
	const today = Temporal.Now.plainDateISO();
	const referenceDate = Temporal.PlainDate.compare(instanceDate, today) > 0 ? instanceDate : today;
	const { mode, interval, unit, anchor } = template;

	if (mode === "relative" || unit === "day") {
		return advanceDate(referenceDate, interval, unit);
	}

	const anchors = anchor.split(" ").map(Number)

	if (unit === "week") {
		let week = referenceDate.subtract({ days: referenceDate.dayOfWeek - 1 });
		while (true) {
			for (const day of anchors) {
				const date = week.add({ days: day });
				if (Temporal.PlainDate.compare(date, referenceDate) > 0) return date;
			}
			week = week.add({ weeks: interval });
		}
	} else {
		let month = referenceDate.with({ day: 1 });
		while (true) {
			for (const day of anchors) {
				const date = month.with({ day: Math.min(day + 1, month.daysInMonth) });
				if (Temporal.PlainDate.compare(date, referenceDate) > 0) return date;
			}
			month = month.add({ months: interval });
		}
	}
};
