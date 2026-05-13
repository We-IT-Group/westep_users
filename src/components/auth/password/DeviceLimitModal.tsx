import { AlertCircle, Laptop, Loader2, Smartphone } from "lucide-react";
import { DeviceLimitExceededDetails, UserDeviceSession } from "../../../api/auth/authApi.ts";

interface DeviceLimitModalProps {
    details: DeviceLimitExceededDetails;
    isDeletingSessionId?: string | null;
    isPending?: boolean;
    errorMessage?: string;
    onClose: () => void;
    onContinue: (sessionId: string) => void;
}

function formatLastSeen(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Noma'lum";

    return new Intl.DateTimeFormat("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function DeviceIcon({ session }: { session: UserDeviceSession }) {
    const deviceName = `${session.platform} ${session.browser} ${session.deviceName}`.toLowerCase();

    if (deviceName.includes("iphone") || deviceName.includes("android") || deviceName.includes("safari")) {
        return <Smartphone className="h-5 w-5" />;
    }

    return <Laptop className="h-5 w-5" />;
}

export default function DeviceLimitModal({
    details,
    isDeletingSessionId,
    isPending,
    errorMessage,
    onClose,
    onContinue,
}: DeviceLimitModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                                Qurilma limiti tugagan
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Siz maksimal {details.maxDevices} ta qurilmadan kira olasiz. Davom etish uchun bittasini o'chiring.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                    >
                        Yopish
                    </button>
                </div>

                {errorMessage ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="mt-6 space-y-4">
                    {details.activeDevices.map((session) => {
                        const isDeleting = isDeletingSessionId === session.sessionId;

                        return (
                            <div
                                key={session.sessionId}
                                className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            <DeviceIcon session={session} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                {session.deviceName}
                                            </h3>
                                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                {session.platform} • {session.browser}
                                            </p>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                So'nggi faollik: {formatLastSeen(session.lastSeenAt)}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-400">
                                                IP: {session.ipAddress}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:min-w-[240px]">
                                        <button
                                            type="button"
                                            onClick={() => onContinue(session.sessionId)}
                                            disabled={Boolean(isPending)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                            O'chirish va davom etish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
