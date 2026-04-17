import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Today from "./pages/Today";
import Navigation from "./pages/Navigation";
import Layout from "./Layout";
import Upcoming from "./pages/Upcoming";
import Notes from "./pages/Notes";
import Vision from "./pages/Vision";

const App: Component = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={Today} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/vision" component={Vision} />
			<Route path="/notes/:id" component={Notes} />
			<Route path="/menu" component={Navigation} />
		</Router>
	);
};

export default App;
