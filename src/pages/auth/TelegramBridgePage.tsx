import {useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {getTelegramClientId} from "../../components/auth/telegram/TelegramLoginButton.tsx";
import {
    readTelegramIdTokenFromLocation,
    readTelegramWidgetAuthFromLocation,
    startTelegramLoginRedirect,
    type TelegramWidgetAuth,
} from "../../components/auth/telegram/openTelegramOidc.ts";
import CommonButton from "../../ui/CommonButton.tsx";

const DEFAULT_TELEGRAM_REDIRECT = "westep://telegram-callback";
const INVALID_REDIRECT_MESSAGE = "Noto'g'ri qaytish manzili";
const BRIDGE_REDIRECT_KEY = "westep.telegram.bridgeRedirect";

function isAllowedTelegramRedirect(raw: string): boolean {
    try {
        const scheme = new URL(raw).protocol.replace(/:$/, "").toLowerCase();
        if (scheme === "westep") return true;
        return import.meta.env.DEV && (scheme === "exp" || scheme.startsWith("exp+"));
    } catch {
        return false;
    }
}

function appendQueryParam(base: string, key: string, value: string) {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}${key}=${encodeURIComponent(value)}`;
}

function bounceWithWidget(redirect: string, widget: TelegramWidgetAuth) {
    let next = appendQueryParam(redirect, "id", String(widget.id));
    next = appendQueryParam(next, "auth_date", String(widget.authDate));
    next = appendQueryParam(next, "hash", widget.hash);
    if (widget.firstName) next = appendQueryParam(next, "first_name", widget.firstName);
    if (widget.lastName) next = appendQueryParam(next, "last_name", widget.lastName);
    if (widget.username) next = appendQueryParam(next, "username", widget.username);
    return next;
}

export default function TelegramBridgePage() {
    const [searchParams] = useSearchParams();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const startedRef = useRef(false);

    const storedRedirect =
        typeof sessionStorage === "undefined" ? "" : sessionStorage.getItem(BRIDGE_REDIRECT_KEY) ?? "";
    const redirect = searchParams.get("redirect")?.trim() || storedRedirect || DEFAULT_TELEGRAM_REDIRECT;
    const redirectAllowed = isAllowedTelegramRedirect(redirect);

    const finish = (url: string) => {
        window.location.href = url;
    };

    const cancel = () => {
        finish(appendQueryParam(redirect, "error", "cancelled"));
    };

    const handleContinue = () => {
        if (!redirectAllowed) {
            setError(INVALID_REDIRECT_MESSAGE);
            return;
        }

        const clientId = getTelegramClientId();
        if (!clientId) {
            cancel();
            return;
        }

        setPending(true);
        setError("");

        try {
            sessionStorage.setItem(BRIDGE_REDIRECT_KEY, redirect);
            const returnPath = `/auth/telegram/bridge?redirect=${encodeURIComponent(redirect)}`;
            startTelegramLoginRedirect(clientId, returnPath);
        } catch {
            cancel();
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        if (!redirectAllowed) {
            return;
        }

        const idToken = readTelegramIdTokenFromLocation();
        if (idToken) {
            finish(appendQueryParam(redirect, "id_token", idToken));
            return;
        }

        const widget = readTelegramWidgetAuthFromLocation();
        if (widget) {
            finish(bounceWithWidget(redirect, widget));
            return;
        }

        if (startedRef.current) {
            return;
        }
        startedRef.current = true;
        handleContinue();
    }, [redirect, redirectAllowed]);

    return (
        <section className="flex w-full flex-col items-center justify-center gap-4">
            {redirectAllowed ? (
                <CommonButton
                    type="button"
                    variant="primary"
                    disabled={pending}
                    isPending={pending}
                    onClick={() => {
                        handleContinue();
                    }}
                >
                    Telegram orqali davom etish
                </CommonButton>
            ) : (
                <p className="text-center text-lg text-error-600 dark:text-error-400">
                    {INVALID_REDIRECT_MESSAGE}
                </p>
            )}
            {error ? (
                <p className="text-center text-lg text-error-600 dark:text-error-400">{error}</p>
            ) : null}
        </section>
    );
}
