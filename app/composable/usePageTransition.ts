// Duração total da animação de transição (ms). Mantenha em sincronia com PageTransition.vue.
export const PAGE_TRANSITION_MS = 1200;

export default function usePageTransition() {
	const active = useState("rxf-page-transition", () => false);

	// A troca de página acontece no meio da animação, com a tela totalmente coberta.
	const go = (to: string) => {
		if (active.value) return;

		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduceMotion) {
			navigateTo(to);
			return;
		}

		active.value = true;
		setTimeout(() => navigateTo(to), PAGE_TRANSITION_MS / 2);
		setTimeout(() => (active.value = false), PAGE_TRANSITION_MS);
	};

	return { active, go };
}
