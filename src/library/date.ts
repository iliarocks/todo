import { Temporal } from "temporal-polyfill";
import { Unit } from "./types";

export const today = (): Temporal.PlainDate => Temporal.Now.plainDateISO();
export const now = (): Temporal.PlainTime => Temporal.Now.plainTimeISO();

export const parseDate = (date: string) => Temporal.PlainDate.from(date);
export const parseTime = (time: string) => Temporal.PlainTime.from(time);

export const compareDate = (a: Temporal.PlainDate, b: Temporal.PlainDate) => Temporal.PlainDate.compare(a, b);
export const compareTime = (a: Temporal.PlainTime, b: Temporal.PlainTime) => Temporal.PlainTime.compare(a, b);

export const advanceDate = (date: Temporal.PlainDate, interval: number, unit: Unit) =>
	date.add({ [unit === "day" ? "days" : unit === "week" ? "weeks" : "months"]: interval });
