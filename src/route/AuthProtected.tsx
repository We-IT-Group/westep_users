import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useUser} from "../api/auth/useAuth.ts";
import Preloader from "../components/common/Preloader.tsx";

const AuthProtected = ({children}: { children: React.ReactNode }) => {
    const location = useLocation();
    const { data: user, isLoading, isError } = useUser();

    if (isLoading) return <Preloader/>;

    if (isError || !user) {
        const next = `${location.pathname}${location.search}${location.hash}`;
        return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
    }

    return <>{children}</>;
};


export default AuthProtected;
