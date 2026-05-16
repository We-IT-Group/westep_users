import React, {ReactNode} from 'react';
import Header from "../headers/Header_new.tsx";
import MobileNavigation from "./MobileNavigation.tsx";
import {useLocation} from "react-router-dom";


const DefaultLayout: React.FC<{ children: ReactNode }> = ({children}) => {

    const location = useLocation();

    function checking() {
        const { pathname } = location;
        const isLessonPlayerPage = /^\/courses\/[^/]+\/[^/]+/.test(pathname);

        if (isLessonPlayerPage) {
            return false;
        }

        return (
            pathname === "/" ||
            pathname === "/courses" ||
            pathname === "/my-courses" ||
            pathname === "/profile" ||
            pathname.startsWith("/notifications") ||
            pathname.startsWith("/buy-course") ||
            pathname.startsWith("/course-purchase") ||
            pathname === "/test-history" ||
            pathname === "/quiz-history" ||
            pathname === "/homework-history"
        );
    }

    return (
        <div className='min-h-dvh px-3 pb-24 pt-3 lg:px-0 lg:pb-0 lg:pt-0'>
            <div>
                <Header/>
                <div className='max-w-[1600px] mx-auto pt-[76px]'>
                    {children}
                </div>
                {
                    checking() && <MobileNavigation/>
                }
            </div>

        </div>
    );
};

export default DefaultLayout;
