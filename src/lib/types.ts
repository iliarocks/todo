import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";

type date = { date: Temporal.PlainDate };
type times = { start?: Temporal.PlainTime; end?: Temporal.PlainTime };

export type RawItem = InstaQLEntity<typeof schema, "items">;
export type RawTemplate = InstaQLEntity<typeof schema, "templates">;

export type Item = Omit<RawItem, "date" | "start" | "end"> & date & times;
export type Template = Omit<RawTemplate, "start" | "end"> & times;
export type User = InstaQLEntity<typeof schema, "$users">;
