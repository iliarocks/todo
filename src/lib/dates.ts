import { Temporal } from "temporal-polyfill";
import { Unit } from "./types";

export const today = (): Temporal.PlainDate => Temporal.Now.plainDateISO();
export const now = (): Temporal.PlainTime =>
	Temporal.Now.plainTimeISO().round({ smallestUnit: "minute" });

export const parseDate = (s: string) => Temporal.PlainDate.from(s);
export const parseTime = (s: string) => Temporal.PlainTime.from(s);

export const advanceDate = (date: Temporal.PlainDate, interval: number, unit: Unit) =>
	date.add({ [unit === "day" ? "days" : unit === "week" ? "weeks" : "months"]: interval });
