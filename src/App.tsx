import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Upcoming from "./pages/Upcoming";
import Create from "./pages/Create";
import Today from "./pages/Today";

const App: Component = () => {
	return (
		<Router>
			<Route path="/" component={Today} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/create" component={Create} />
		</Router>
	);
};

export default App;
