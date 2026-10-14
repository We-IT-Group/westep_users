import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AcademyRail from "../academy/AcademyRail.tsx";
import AcademyTopbar from "../academy/AcademyTopbar.tsx";

function isLessonWorkspace(pathname: string) {
    return pathname.startsWith("/courses/") || pathname.startsWith("/test/");
}

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const lesson = isLessonWorkspace(location.pathname);

    return (
        <div className="academy-app">
            <AcademyRail />
            <main className="academy-stage">
                {lesson ? null : <AcademyTopbar />}
                <div className={`academy-scroll${lesson ? " lesson" : ""}`}>{children}</div>
            </main>
        </div>
    );
};

export default DefaultLayout;
