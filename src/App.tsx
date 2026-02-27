import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Home from "./pages/Home";
import Upcoming from "./pages/Upcoming";
import Create from "./pages/Create";

const App: Component = () => {
	return (
		<Router>
			<Route path="/" component={Home} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/create" component={Create} />
		</Router>
	);
};

export default App;
