import { Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Upcoming from "./pages/Upcoming";
import Create from "./pages/Create";
import Today from "./pages/Today";
import Edit from "./pages/Edit";
import EditTemplate from "./pages/EditTemplate";
import Navigation from "./pages/Navigation";
import Layout from "./Layout";

const App: Component = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={Today} />
			<Route path="/upcoming" component={Upcoming} />
			<Route path="/create" component={Create} />
			<Route path="/edit/:id" component={Edit} />
			<Route path="/edit/template/:id" component={EditTemplate} />
			<Route path="/menu" component={Navigation} />
		</Router>
	);
};

export default App;
