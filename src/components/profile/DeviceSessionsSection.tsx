import { Laptop, Loader2, Shield, Smartphone, Trash2 } from "lucide-react";
import { useDeleteMyDevice, useMyDevices } from "../../api/device/useDevice.ts";
import { getOrCreateDeviceId } from "../../utils/device.ts";
import { useToast } from "../../hooks/useToast.tsx";

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

function DeviceIcon({ label }: { label: string }) {
    const normalized = label.toLowerCase();

    if (normalized.includes("iphone") || normalized.includes("android") || normalized.includes("safari")) {
        return <Smartphone className="h-5 w-5" />;
    }

    return <Laptop className="h-5 w-5" />;
}

export default function DeviceSessionsSection() {
    const toast = useToast();
    const currentDeviceId = getOrCreateDeviceId();
    const { data: devices = [], isPending, isError, error } = useMyDevices();
    const { mutate: deleteDevice, isPending: isDeleting } = useDeleteMyDevice();

    return (
        <section className="space-y-8 sm:space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        Qurilmalar
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Faol sessiyalarni ko'ring va kerak bo'lsa o'chiring.
                    </p>
                </div>
                <div className="rounded-full bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {devices.length} ta faol qurilma
                </div>
            </div>

            {isPending ? (
                <div className="flex items-center justify-center rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : isError ? (
                <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                    {error instanceof Error ? error.message : "Qurilmalarni yuklab bo'lmadi"}
                </div>
            ) : devices.length === 0 ? (
                <div className="rounded-[32px] border-4 border-dashed border-slate-100 p-10 text-center dark:border-slate-800">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700">
                        <Shield className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-semibold italic text-slate-500">
                        Hozircha faol qurilmalar topilmadi.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {devices.map((device) => {
                        const isCurrentDevice = device.deviceId === currentDeviceId;

                        return (
                            <div
                                key={device.sessionId}
                                className="flex flex-col gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-start sm:justify-between sm:p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <DeviceIcon label={`${device.platform} ${device.browser} ${device.deviceName}`} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                {device.deviceName}
                                            </h3>
                                            {isCurrentDevice ? (
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                    Joriy qurilma
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                            {device.platform} • {device.browser}
                                        </p>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            So'nggi faollik: {formatLastSeen(device.lastSeenAt)}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-400">
                                            IP: {device.ipAddress}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteDevice(device.sessionId, {
                                            onSuccess: () => {
                                                toast.success("Qurilma o'chirildi");
                                            },
                                            onError: (mutationError) => {
                                                toast.error(mutationError.message);
                                            },
                                        })
                                    }
                                    disabled={isDeleting}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    O'chirish
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
