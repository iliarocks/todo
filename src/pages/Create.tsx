import { type Component, createSignal, Switch, Match } from "solid-js";
import { db } from "../lib/db";
import { id } from "@instantdb/solidjs";
import { format, parse, startOfDay } from "date-fns";
import Button from "../components/Button";
import Input from "../components/Input";

const Create: Component = () => {
	const [formType, setFormType] = createSignal<"todo" | "event">("todo");

	return (
		<main class="grid h-screen w-screen place-items-center">
			<div class="flex flex-col gap-s w-full px-xs md:w-[450px]">
				<section class="flex gap-xs">
					<Button
						onClick={() => setFormType("todo")}
						classList={{ "text-[var(--secondary)]": formType() === "event" }}
					>
						Todo
					</Button>
					<Button
						onClick={() => setFormType("event")}
						classList={{ "text-[var(--secondary)]": formType() === "todo" }}
					>
						Event
					</Button>
				</section>
				<Switch>
					<Match when={formType() === "todo"}>
						<TodoForm />
					</Match>
					<Match when={formType() === "event"}>
						<EventForm />
					</Match>
				</Switch>
			</div>
		</main>
	);
};

const EventForm: Component = () => {
	const [text, setText] = createSignal("");
	const [date, setDate] = createSignal(format(new Date(), "yyyy-MM-dd"));
	const [startTime, setStartTime] = createSignal(format(new Date(), "HH:mm"));
	const [endTime, setEndTime] = createSignal(format(new Date(), "HH:mm"));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (!text() || !date() || !startTime() || !endTime()) return;

		db.transact(
			db.tx.items[id()].create({
				type: "event",
				text: text(),
				date: startOfDay(parse(date(), "yyyy-MM-dd", new Date())).toISOString(),
				startTime: startTime(),
				endTime: endTime(),
			}),
		);
	};

	return (
		<form class="flex flex-col gap-s" onSubmit={handleSubmit}>
			<Input
				placeholder="Text"
				value={text()}
				onInput={(e) => setText(e.currentTarget.value)}
			/>
			<section class="flex justify-between">
				<section class="flex gap-xs">
					<Input
						type="date"
						value={date()}
						onInput={(e) => setDate(e.currentTarget.value)}
					/>
					<Input
						type="time"
						value={startTime()}
						onInput={(e) => setStartTime(e.currentTarget.value)}
					/>
					<Input
						type="time"
						value={endTime()}
						onInput={(e) => setEndTime(e.currentTarget.value)}
					/>
				</section>
				<Button type="submit">Submit</Button>
			</section>
		</form>
	);
};

const TodoForm: Component = () => {
	const [text, setText] = createSignal("");
	const [date, setDate] = createSignal(format(new Date(), "yyyy-MM-dd"));

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (!text() || !date()) return;

		db.transact(
			db.tx.items[id()].create({
				type: "todo",
				text: text(),
				date: startOfDay(parse(date(), "yyyy-MM-dd", new Date())).toISOString(),
			}),
		);
	};

	return (
		<form class="flex flex-col gap-s" onSubmit={handleSubmit}>
			<Input
				type="text"
				placeholder="Text"
				value={text()}
				onInput={(e) => setText(e.currentTarget.value)}
			/>
			<section class="flex justify-between">
				<Input
					type="date"
					value={date()}
					onInput={(e) => setDate(e.currentTarget.value)}
					class="p-xs bg-[var(--tertiary)]"
				/>
				<Button type="submit">Submit</Button>
			</section>
		</form>
	);
};

export default Create;
