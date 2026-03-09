import { InstaQLEntity } from "@instantdb/solidjs";
import schema from "../instant.schema";

export type Template = InstaQLEntity<typeof schema, "templates", { instance: {} }, undefined, true>;
export type Item = InstaQLEntity<typeof schema, "items", { template: {} }, undefined, true>;
