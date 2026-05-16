import {createContext, useEffect, useState, ReactNode} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => {
    },
});

interface Props {
    children: ReactNode;
}

export function ThemeProvider({children}: Props) {
    const [theme, setTheme] = useState<Theme>(
        (localStorage.getItem("theme") as Theme) || "dark"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}
