import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

//routes
import { authProtectedRoutes, publicRoutes, OnboardingPage } from './allRoutes';
import AuthProtected from "./AuthProtected.tsx";
import DefaultLayout from "../layouts/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout";
// import ProtectedRoute from './ProtectedRoute.tsx';

const Index = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route element={
                    <AuthLayout>
                        <Outlet />
                    </AuthLayout>
                }>
                    {publicRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={route.element}
                            key={idx}
                        />
                    ))}
                </Route>
                <Route element={
                    <AuthProtected>
                        <DefaultLayout>
                            <Outlet />
                        </DefaultLayout>
                    </AuthProtected>
                }>
                    {authProtectedRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={route.element}
                            key={idx}
                        />
                    ))}
                </Route>
            </Routes>
        </React.Fragment>
    );
};

export default Index;
