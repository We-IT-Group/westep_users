import React, {ReactNode} from 'react';
import ThemeToggle from "../ThemeToggle.tsx";

const AuthLayout: React.FC<{ children: ReactNode }> = ({children}) => {
    return (
        <div className='auth-back relative transition-colors duration-300'>
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                <ThemeToggle/>
            </div>
            <div className='auth-glass px-4 py-16 sm:px-6'>
                <div className='relative z-10 mx-auto w-full md:w-4/5 lg:w-3/5'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
