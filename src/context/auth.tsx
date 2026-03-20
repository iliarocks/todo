import { User } from "@instantdb/solidjs";
import { createContext, ParentComponent, useContext } from "solid-js";

const AuthContext = createContext<User>();

export const AuthProvider: ParentComponent<{ user: User }> = (props) => {
	return <AuthContext.Provider value={props.user}>{props.children}</AuthContext.Provider>;
};

export const useUser = () => {
	const user = useContext(AuthContext);
	if (user === undefined) throw new Error("No authenticated user");
	return user;
}
