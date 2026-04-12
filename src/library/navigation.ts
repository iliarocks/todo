import { useLocation, useNavigate } from "@solidjs/router";

export const useNavigation = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const origin = () => (location.state as any)?.origin ?? "/upcoming";

	return {
		push: (path: string) => navigate(path, { state: { origin: location.pathname } }),
		replace: (path: string) => navigate(path, { replace: true, state: { origin: origin() } }),
		back: () => navigate(origin(), { replace: true }),
	};
};
