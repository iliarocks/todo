import { id, init, User } from "@instantdb/solidjs";
import schema from "../instant.schema";
import { Temporal } from "temporal-polyfill";
import {
	Item,
	Project,
	Vision,
	serializeItem,
	serializeItemUpdate,
	serializeTemplate,
	serializeTemplateUpdate,
	Template,
} from "./types";
import { compareDate, today } from "./date";
import { nextDate } from "./repeat";

export const db = init({
	appId: import.meta.env.VITE_INSTANT_APP_ID!,
	schema,
});

export const createItem = (
	item: Omit<Item, "id">,
	user: User,
	template?: Omit<Template, "id" | "reference">,
	projectId?: string,
) => {
	const itemId = id();
	let itemChunk = db.tx.items[itemId].create(serializeItem(item)).link({ user: user.id });
	if (projectId) itemChunk = itemChunk.link({ project: projectId });

	if (template) {
		let templateChunk = db.tx.templates[id()]
			.create(
				serializeTemplate({
					...template,
					reference: template.mode === "absolute" ? item.date : undefined,
				}),
			)
			.link({ user: user.id, instance: itemId });
		if (projectId) templateChunk = templateChunk.link({ project: projectId });

		db.transact([itemChunk, templateChunk]);
	} else {
		db.transact(itemChunk);
	}
};

export const updateItem = (item: Item, update: Partial<Omit<Item, "id">>) => {
	db.transact(db.tx.items[item.id].update(serializeItemUpdate(update)));
};

export const updateTemplate = (
	template: Template,
	update: Partial<Omit<Template, "id" | "reference">>,
) => {
	db.transact(db.tx.templates[template.id].update(serializeTemplateUpdate(update)));
};

export const deleteItem = (item: Item & { template?: Template }, projectId?: string) => {
	if (!item.template) {
		db.transact(db.tx.items[item.id].delete());
		return;
	}

	const { template } = item;
	let chunk = db.tx.items[item.id].update(
		serializeItemUpdate({
			type: template.type,
			text: template.text,
			date: nextDate(item.date, template),
			start: template.start,
			end: template.end,
			notes: template.notes,
		}),
	);
	if (projectId) chunk = chunk.link({ project: projectId });
	db.transact(chunk);
};

export const deleteTemplate = (template: Template) => {
	db.transact(db.tx.templates[template.id].delete());
};

export const createVision = (text: string, user: User) => {
	db.transact(db.tx.visions[id()].create({ text }).link({ user: user.id }));
};

export const updateVision = (vision: Vision, text: string) => {
	db.transact(db.tx.visions[vision.id].update({ text }));
};

export const createProject = (name: string, active: boolean, user: User) => {
	db.transact(db.tx.projects[id()].create({ name, active }).link({ user: user.id }));
};

export const updateProject = (project: Project, update: { name?: string; notes?: string | null; active?: boolean }) => {
	db.transact(db.tx.projects[project.id].update(update));
};

export const deleteProject = (project: Project) => {
	db.transact(db.tx.projects[project.id].delete());
};

export const linkItemProject = (itemId: string, projectId: string) => {
	db.transact(db.tx.items[itemId].link({ project: projectId }));
};

export const unlinkItemProject = (itemId: string, projectId: string) => {
	db.transact(db.tx.items[itemId].unlink({ project: projectId }));
};

export const linkTemplateProject = (templateId: string, projectId: string) => {
	db.transact(db.tx.templates[templateId].link({ project: projectId }));
};

export const unlinkTemplateProject = (templateId: string, projectId: string) => {
	db.transact(db.tx.templates[templateId].unlink({ project: projectId }));
};

export const saveReminder = (
	vision: Vision,
	date: Temporal.PlainDate,
	order: string,
	user: User,
) => {
	const { reminder } = vision;

	if (reminder && compareDate(reminder.date, today()) >= 0) {
		db.transact(db.tx.items[reminder.id].update(serializeItemUpdate({ date })));
		return;
	}

	const reminderId = id();
	db.transact([
		db.tx.items[reminderId]
			.create(serializeItem({ type: "todo", text: "Revisit vision", date, order }))
			.link({ user: user.id }),
		db.tx.visions[vision.id].link({ reminder: reminderId }),
	]);
};
