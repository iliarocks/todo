import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Create from "./pages/Create";
import Today from "./pages/Today";
import Navigation from "./pages/Navigation";
import Layout from "./Layout";
import Upcoming from "./pages/Upcoming";
import Notes from "./pages/Notes";
import Edit from "./pages/Edit";

const App: Component = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={Today} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/notes/:type/:id" component={Notes} />
			<Route path="/edit/:type/:id" component={Edit} />
			<Route path="/create" component={Create} />
			<Route path="/menu" component={Navigation} />
		</Router>
	);
};

export default App;
