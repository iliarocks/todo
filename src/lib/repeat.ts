import {
	addDays,
	addMonths,
	addWeeks,
	endOfMonth,
	max,
	min,
	startOfMonth,
	startOfToday,
	startOfWeek,
} from "date-fns";

export const advanceDate = (date: Date, interval: number, unit: string): Date => {
	if (unit === "week") return addWeeks(date, interval);
	if (unit === "month") return addMonths(date, interval);
	return addDays(date, interval);
};

export const nextOccurrenceDate = (
	config: { mode: string; interval: number; unit: string; anchor?: string | null },
	instanceDate: Date,
): Date => {
	const referenceDate = max([instanceDate, startOfToday()]);

	if (config.mode === "relative" || config.unit === "day") {
		return advanceDate(referenceDate, config.interval, config.unit);
	}

	const anchors = (config.anchor ?? "0")
		.split(" ")
		.map(Number)
		.sort((a, b) => a - b);

	if (config.unit === "week") {
		let week = startOfWeek(referenceDate);
		while (true) {
			for (const day of anchors) {
				const date = addDays(week, day);
				if (date > referenceDate) return date;
			}
			week = addWeeks(week, config.interval);
		}
	} else {
		// month
		let month = startOfMonth(referenceDate);
		while (true) {
			for (const day of anchors) {
				const date = min([addDays(month, day), endOfMonth(month)]);
				if (date > referenceDate) return date;
			}
			month = addMonths(month, config.interval);
		}
	}
};
