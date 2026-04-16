export type ThemeId = "navy-cyan" | "midnight-purple" | "forest-green" | "slate-orange";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  swatches: string[];
  vars: Record<string, string>;
}

export const THEMES: ThemeDef[] = [
  {
    id: "navy-cyan",
    name: "Navy Cyan",
    swatches: ["#0f172a", "#1e293b", "#22d3ee"],
    vars: {
      "--background": "222 47% 7%",
      "--foreground": "210 40% 90%",
      "--border": "220 20% 18%",
      "--input": "220 20% 18%",
      "--ring": "199 89% 48%",
      "--card": "222 40% 10%",
      "--card-foreground": "210 40% 90%",
      "--sidebar": "222 47% 6%",
      "--sidebar-foreground": "210 30% 80%",
      "--sidebar-border": "220 20% 14%",
      "--sidebar-primary": "199 89% 48%",
      "--sidebar-primary-foreground": "222 47% 6%",
      "--sidebar-accent": "220 25% 13%",
      "--sidebar-accent-foreground": "210 40% 90%",
      "--sidebar-ring": "199 89% 48%",
      "--primary": "199 89% 48%",
      "--primary-foreground": "222 47% 6%",
      "--secondary": "220 25% 14%",
      "--secondary-foreground": "210 30% 75%",
      "--muted": "220 25% 13%",
      "--muted-foreground": "215 20% 50%",
      "--accent": "220 25% 15%",
      "--accent-foreground": "210 40% 90%",
      "--popover": "222 40% 10%",
      "--popover-foreground": "210 40% 90%",
    },
  },
  {
    id: "midnight-purple",
    name: "Midnight",
    swatches: ["#09090b", "#18181b", "#a78bfa"],
    vars: {
      "--background": "240 10% 4%",
      "--foreground": "0 0% 92%",
      "--border": "240 6% 16%",
      "--input": "240 6% 16%",
      "--ring": "262 83% 74%",
      "--card": "240 8% 7%",
      "--card-foreground": "0 0% 92%",
      "--sidebar": "240 10% 3%",
      "--sidebar-foreground": "240 5% 75%",
      "--sidebar-border": "240 6% 12%",
      "--sidebar-primary": "262 83% 74%",
      "--sidebar-primary-foreground": "240 10% 4%",
      "--sidebar-accent": "240 6% 11%",
      "--sidebar-accent-foreground": "0 0% 92%",
      "--sidebar-ring": "262 83% 74%",
      "--primary": "262 83% 74%",
      "--primary-foreground": "240 10% 4%",
      "--secondary": "240 6% 12%",
      "--secondary-foreground": "240 5% 70%",
      "--muted": "240 6% 11%",
      "--muted-foreground": "240 5% 45%",
      "--accent": "240 6% 13%",
      "--accent-foreground": "0 0% 92%",
      "--popover": "240 8% 7%",
      "--popover-foreground": "0 0% 92%",
    },
  },
  {
    id: "forest-green",
    name: "Forest",
    swatches: ["#0d1f12", "#14291b", "#4ade80"],
    vars: {
      "--background": "138 40% 7%",
      "--foreground": "140 20% 90%",
      "--border": "138 20% 16%",
      "--input": "138 20% 16%",
      "--ring": "142 71% 55%",
      "--card": "138 35% 10%",
      "--card-foreground": "140 20% 90%",
      "--sidebar": "138 40% 6%",
      "--sidebar-foreground": "138 15% 78%",
      "--sidebar-border": "138 20% 12%",
      "--sidebar-primary": "142 71% 55%",
      "--sidebar-primary-foreground": "138 40% 6%",
      "--sidebar-accent": "138 25% 12%",
      "--sidebar-accent-foreground": "140 20% 90%",
      "--sidebar-ring": "142 71% 55%",
      "--primary": "142 71% 55%",
      "--primary-foreground": "138 40% 6%",
      "--secondary": "138 25% 13%",
      "--secondary-foreground": "138 15% 72%",
      "--muted": "138 25% 12%",
      "--muted-foreground": "138 15% 48%",
      "--accent": "138 25% 14%",
      "--accent-foreground": "140 20% 90%",
      "--popover": "138 35% 10%",
      "--popover-foreground": "140 20% 90%",
    },
  },
  {
    id: "slate-orange",
    name: "Ember",
    swatches: ["#111318", "#1c2028", "#fb923c"],
    vars: {
      "--background": "222 18% 7%",
      "--foreground": "220 15% 90%",
      "--border": "222 14% 17%",
      "--input": "222 14% 17%",
      "--ring": "25 95% 60%",
      "--card": "222 16% 10%",
      "--card-foreground": "220 15% 90%",
      "--sidebar": "222 18% 6%",
      "--sidebar-foreground": "220 12% 78%",
      "--sidebar-border": "222 14% 13%",
      "--sidebar-primary": "25 95% 60%",
      "--sidebar-primary-foreground": "222 18% 6%",
      "--sidebar-accent": "222 14% 12%",
      "--sidebar-accent-foreground": "220 15% 90%",
      "--sidebar-ring": "25 95% 60%",
      "--primary": "25 95% 60%",
      "--primary-foreground": "222 18% 6%",
      "--secondary": "222 14% 13%",
      "--secondary-foreground": "220 12% 72%",
      "--muted": "222 14% 12%",
      "--muted-foreground": "220 12% 48%",
      "--accent": "222 14% 14%",
      "--accent-foreground": "220 15% 90%",
      "--popover": "222 16% 10%",
      "--popover-foreground": "220 15% 90%",
    },
  },
];

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  localStorage.setItem("luffy-theme", id);
}

export function loadSavedTheme() {
  const saved = localStorage.getItem("luffy-theme") as ThemeId | null;
  if (saved && THEMES.find((t) => t.id === saved)) {
    applyTheme(saved);
  }
}

export function getSavedTheme(): ThemeId {
  return (localStorage.getItem("luffy-theme") as ThemeId) || "navy-cyan";
}
