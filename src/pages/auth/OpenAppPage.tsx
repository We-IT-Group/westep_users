import {useEffect, useState} from "react";

const APP_URL = "westep://";
const IOS_STORE = "https://apps.apple.com/app/id6790870130";
const ANDROID_STORE = "https://play.google.com/store/apps/details?id=uz.westep.academy";

export default function OpenAppPage() {
    const [showStores, setShowStores] = useState(false);
    useEffect(() => {
        window.location.href = APP_URL;
        const t = window.setTimeout(() => setShowStores(true), 1500);
        return () => window.clearTimeout(t);
    }, []);
    return (
        <div style={{maxWidth: 420, margin: "64px auto", padding: 16, textAlign: "center", fontFamily: "inherit"}}>
            <h1 style={{fontSize: 22}}>WeStep ilovasi ochilmoqda…</h1>
            <p><a href={APP_URL}>Ilovani ochish</a></p>
            {showStores && (
                <p>
                    Ilova o'rnatilmaganmi? <a href={IOS_STORE}>App Store</a> · <a href={ANDROID_STORE}>Google Play</a>
                </p>
            )}
        </div>
    );
}
