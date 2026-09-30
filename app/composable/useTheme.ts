export type Theme = "light" | "dark";

const STORAGE_KEY = "rxf-theme";
const DARK_CLASS = "app-dark";

const themeState = () => useState<Theme>("theme", () => "light");

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
}

// O tema vale só para a sessão: sessionStorage sobrevive ao F5, mas é limpo no logout.
export function useTheme() {
  const theme = themeState();

  function setTheme(next: Theme) {
    theme.value = next;
    if (!import.meta.client) return;
    applyTheme(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  return { theme, setTheme };
}

export function restoreTheme() {
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(STORAGE_KEY);
  } catch {}
  const theme: Theme = stored === "dark" ? "dark" : "light";
  themeState().value = theme;
  applyTheme(theme);
}

export function resetTheme() {
  themeState().value = "light";
  if (!import.meta.client) return;
  applyTheme("light");
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
