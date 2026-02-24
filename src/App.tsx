import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Today from "./pages/Today";

const App: Component = () => {
	return (
		<Router>
			<Route path="/" component={Today} />
		</Router>
	);
};

export default App;
