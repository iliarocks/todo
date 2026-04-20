import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Today from "./pages/Today";
import Layout from "./Layout";
import Upcoming from "./pages/Upcoming";
import Notes from "./pages/Notes";
import Vision from "./pages/Vision";
import Docs from "./pages/Docs";
import Project from "./pages/Project";

const App: Component = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={Today} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/vision" component={Vision} />
			<Route path="/notes/:id" component={Notes} />
			<Route path="/docs" component={Docs} />
			<Route path="/project/:id" component={Project} />
		</Router>
	);
};

export default App;
