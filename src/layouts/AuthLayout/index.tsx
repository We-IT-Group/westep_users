import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";

function authCopy(pathname: string) {
    if (pathname.startsWith("/register") || pathname.startsWith("/create-password")) {
        return {
            title: "O‘zing haqingda aytib ber",
            body: "Yoshga qarab uy, o‘yin va yozuvlar moslashadi. 10 yoshgacha ota-ona raqami kerak.",
        };
    }
    if (pathname.startsWith("/password") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
        return {
            title: "Parolingni yoz",
            body: "Bu parol faqat sening. Ota-onaga aytmasdan ham kira olasan.",
        };
    }
    return {
        title: "Salom! Westepga kiramiz",
        body: "Bola birinchi kelganda raqam, ism va tug‘ilgan kun bilan o‘z joyini ochadi.",
    };
}

const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const copy = authCopy(location.pathname);

    return (
        <div className="academy-auth">
            <div className="academy-auth-art">
                <img className="bg" src="/academy/stage.jpg" alt="" />
                <div className="academy-westy-float">
                    <img src="/academy/westy.png" alt="Westy" />
                </div>
                <div className="copy">
                    <h1 className="!text-white drop-shadow-lg">{copy.title}</h1>
                    <p className="!text-white/95 drop-shadow">{copy.body}</p>
                </div>
            </div>
            <div className="academy-auth-form">{children}</div>
        </div>
    );
};

export default AuthLayout;
