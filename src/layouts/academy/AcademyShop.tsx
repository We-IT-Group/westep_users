import { useState } from "react";
import { resolveAssetUrl } from "../../api/apiClient.ts";
import { useToast } from "../../hooks/useToast.tsx";
import { useGiftCatalog, useMyGiftOrders, useOrderGift, useWallet } from "../../api/rewards/useRewards.ts";
import AcademyStatsNav from "./AcademyStatsNav.tsx";

const ORDER_STATUS: Record<string, string> = {
    NEW: "Qabul qilindi",
    APPROVED: "Tasdiqlandi",
    SHIPPED: "Jo‘natildi",
    DELIVERED: "Yetkazildi",
    REJECTED: "Rad etildi · coin qaytdi",
};

function coins(value: number) {
    return value.toLocaleString("uz-UZ");
}

export default function AcademyShop() {
    const toast = useToast();
    const walletQuery = useWallet();
    const catalogQuery = useGiftCatalog();
    const ordersQuery = useMyGiftOrders();
    const orderMutation = useOrderGift();
    const [pendingId, setPendingId] = useState<string | null>(null);

    const balance = walletQuery.data?.balance ?? 0;
    const items = catalogQuery.data ?? [];
    const orders = ordersQuery.data ?? [];

    const confirmOrder = (giftItemId: string, name: string) => {
        orderMutation.mutate(
            { giftItemId },
            {
                onSuccess: () => {
                    setPendingId(null);
                    toast.success("Qabul qilindi! 🎉", `"${name}" buyurtmasi ko‘rib chiqilmoqda.`);
                },
                onError: (error) => toast.error(error.message),
            },
        );
    };

    return (
        <div className="academy-stats academy-dash">
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <h2>Sovg‘alar do‘koni</h2>
                    <p>Coinlaringni haqiqiy sovg‘aga almashtir</p>
                </div>
                <div className="academy-dash-kpis">
                    <div className="academy-kpi">
                        <b>{coins(balance)}</b>
                        <span>coin balans</span>
                    </div>
                </div>
            </div>

            <AcademyStatsNav />

            {catalogQuery.isPending ? (
                <div className="academy-stats-skeleton" />
            ) : catalogQuery.isError ? (
                <div className="academy-card">
                    <p className="academy-quiet">{catalogQuery.error.message}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="academy-card academy-empty-inline">
                    <b>Do‘kon hozircha bo‘sh</b>
                    <p>Tez orada sovg‘alar paydo bo‘ladi. Coin yig‘ishda davom et.</p>
                </div>
            ) : (
                <div className="academy-gift-grid">
                    {items.map((item) => {
                        const affordable = balance >= item.coinPrice;
                        const outOfStock = item.stock != null && item.stock <= 0;
                        const image = resolveAssetUrl(item.imageUrl);
                        const confirming = pendingId === item.id;
                        return (
                            <div key={item.id} className="academy-card academy-gift-card">
                                {image ? (
                                    <img src={image} alt="" />
                                ) : (
                                    <div className="academy-gift-ph">🎁</div>
                                )}
                                <b>{item.name}</b>
                                {item.description ? <p>{item.description}</p> : null}
                                <strong>🪙 {coins(item.coinPrice)} coin</strong>
                                {confirming ? (
                                    <div className="academy-confirm">
                                        <p>
                                            “{item.name}” uchun {coins(item.coinPrice)} coin yechiladi.
                                        </p>
                                        <div className="academy-confirm-actions">
                                            <button type="button" onClick={() => setPendingId(null)}>
                                                Bekor
                                            </button>
                                            <button
                                                type="button"
                                                className="go"
                                                disabled={orderMutation.isPending}
                                                onClick={() => confirmOrder(item.id, item.name)}
                                            >
                                                {orderMutation.isPending ? "Yuborilmoqda..." : "Buyurtma beraman"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="academy-cta academy-cta-brand academy-cta-compact"
                                        disabled={!affordable || outOfStock}
                                        onClick={() => setPendingId(item.id)}
                                    >
                                        {outOfStock
                                            ? "Zaxirada qolmagan"
                                            : affordable
                                              ? "Buyurtma berish"
                                              : `Yana ${coins(item.coinPrice - balance)} coin`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {orders.length > 0 ? (
                <div className="academy-card">
                    <h3>Buyurtmalarim</h3>
                    <div className="academy-order-list">
                        {orders.map((order) => (
                            <div key={order.id} className="academy-order">
                                <div>
                                    <b>
                                        {order.mystery ? "🎁 " : ""}
                                        {order.giftName}
                                    </b>
                                    {order.coinPrice > 0 ? <small>{coins(order.coinPrice)} coin</small> : null}
                                </div>
                                <span
                                    className={`academy-badge ${
                                        order.status === "DELIVERED"
                                            ? "ok"
                                            : order.status === "REJECTED"
                                              ? "wait"
                                              : "play"
                                    }`}
                                >
                                    {ORDER_STATUS[order.status] || order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
