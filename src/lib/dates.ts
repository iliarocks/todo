import { Temporal } from "temporal-polyfill";
import { Unit } from "./types";

export const today = (): Temporal.PlainDate => Temporal.Now.plainDateISO();
export const now = (): Temporal.PlainTime =>
	Temporal.Now.plainTimeISO().round({ smallestUnit: "minute" });

export const parsePlainDate = (s: string) => Temporal.PlainDate.from(s);
export const parsePlainTime = (s: string) =>
	Temporal.PlainTime.from(s).round({ smallestUnit: "minute" });

export const advanceDate = (date: Temporal.PlainDate, interval: number, unit: Unit) =>
	date.add({ [unit === "day" ? "days" : unit === "week" ? "weeks" : "months"]: interval });
