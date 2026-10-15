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
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="font-fredoka text-2xl font-semibold">Qurilmalar</h3>
                    <p className="academy-quiet text-sm">Faol sessiyalarni ko'ring va kerak bo'lsa o'chiring.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-500">
                    {devices.length} ta faol qurilma
                </span>
            </div>

            {isPending ? (
                <div className="academy-card flex items-center justify-center !p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
            ) : isError ? (
                <div className="rounded-[24px] bg-rose-50 p-5 text-sm font-bold text-rose-600">
                    {error instanceof Error ? error.message : "Qurilmalarni yuklab bo'lmadi"}
                </div>
            ) : devices.length === 0 ? (
                <div className="academy-card space-y-3 !py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-300">
                        <Shield className="h-7 w-7" />
                    </div>
                    <p className="academy-quiet">Hozircha faol qurilmalar topilmadi.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {devices.map((device) => {
                        const isCurrentDevice = device.deviceId === currentDeviceId;

                        return (
                            <div
                                key={device.sessionId}
                                className="academy-card flex flex-col gap-4 !p-4 sm:flex-row sm:items-start sm:justify-between sm:!p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
                                        <DeviceIcon label={`${device.platform} ${device.browser} ${device.deviceName}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-base font-extrabold">{device.deviceName}</h4>
                                            {isCurrentDevice ? (
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700">
                                                    Joriy qurilma
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="academy-quiet text-sm">
                                            {device.platform} • {device.browser}
                                        </p>
                                        <p className="academy-quiet text-xs">
                                            So'nggi faollik: {formatLastSeen(device.lastSeenAt)} · IP: {device.ipAddress}
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
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-extrabold text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
