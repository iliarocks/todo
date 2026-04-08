import { useLocation, useNavigate } from "@solidjs/router";

export const useNavigateFromList = () => {
	const location = useLocation();
	const navigate = useNavigate();
	return (path: string) => navigate(path, { state: { origin: location.pathname } });
};

export const useNavigateToList = () => {
	const location = useLocation();
	const navigate = useNavigate();
	return () => navigate((location.state as any)?.origin ?? "/upcoming", { replace: true });
};
