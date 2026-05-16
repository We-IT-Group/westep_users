import {useContext} from "react";
import {Moon, Sun} from "lucide-react";
import {ThemeContext} from "./ThemeContext";

export default function ThemeToggle() {
    const {theme, toggleTheme} = useContext(ThemeContext);

    return (
        <button
            type="button"
            aria-label={theme === "light" ? "Dark mode yoqish" : "Light mode yoqish"}
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:text-blue-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-yellow-300"
        >
            {theme === "light" ? <Moon size={20}/> : <Sun size={20}/>}
        </button>
    );
}
