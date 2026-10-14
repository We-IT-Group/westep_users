import { NavLink } from "react-router-dom";

const tabs = [
    { to: "/statistics", label: "Faollik" },
    { to: "/rewards", label: "Mukofotlar" },
    { to: "/shop", label: "Sovg‘alar" },
    { to: "/leaderboard", label: "⭐ Reyting" },
] as const;

export default function AcademyStatsNav() {
    return (
        <nav className="academy-dash-tabs" aria-label="Statistika bo‘limi">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.to === "/statistics"}
                    className={({ isActive }) => (isActive ? "on" : "")}
                >
                    {tab.label}
                </NavLink>
            ))}
        </nav>
    );
}
