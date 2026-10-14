import { Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast.tsx";
import {
    useAchievements,
    useCompleteHabit,
    useRewardCertificates,
    useTodayHabit,
    useWallet,
} from "../../api/rewards/useRewards.ts";
import AcademyStatsNav from "./AcademyStatsNav.tsx";

function coins(value: number) {
    return value.toLocaleString("uz-UZ");
}

export default function AcademyRewards() {
    const toast = useToast();
    const walletQuery = useWallet();
    const achievementsQuery = useAchievements();
    const certificatesQuery = useRewardCertificates();
    const todayHabitQuery = useTodayHabit();
    const completeHabit = useCompleteHabit();

    const wallet = walletQuery.data;
    const achievements = achievementsQuery.data ?? [];
    const certificates = certificatesQuery.data ?? [];
    const earned = achievements.filter((item) => item.earned);
    const locked = achievements.filter((item) => !item.earned);
    const habit = todayHabitQuery.data;

    return (
        <div className="academy-stats academy-dash">
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <h2>Mukofotlarim</h2>
                    <p>Coinlar, yutuqlar va sertifikatlar</p>
                </div>
            </div>

            <AcademyStatsNav />

            <div className="academy-dash-main academy-dash-main-reward">
                <div className="academy-card academy-wallet">
                    <div className="academy-wallet-row">
                        <span className="academy-wallet-emoji">🪙</span>
                        <div>
                            <b>{coins(wallet?.balance ?? 0)} coin</b>
                            <small>Jami ishlangan: {coins(wallet?.totalEarned ?? 0)}</small>
                        </div>
                        <Link to="/shop" className="academy-cta academy-cta-brand academy-cta-compact">
                            Sovg‘alar do‘koni
                        </Link>
                    </div>
                </div>

                {habit?.habit ? (
                    <div className="academy-card academy-habit">
                        <small className="academy-habit-label">Bugungi yaxshi odat</small>
                        <div className="academy-habit-row">
                            <h3>{habit.habit.title}</h3>
                            {habit.status === "CONFIRMED" ? (
                                <p className="academy-habit-ok">Tasdiqlangan · +{habit.habit.coinReward} coin</p>
                            ) : habit.status === "PENDING_PARENT" ? (
                                <p>Ota-ona tasdig‘i kutilmoqda</p>
                            ) : (
                                <button
                                    type="button"
                                    className="academy-cta academy-cta-brand academy-cta-compact"
                                    disabled={completeHabit.isPending}
                                    onClick={() =>
                                        completeHabit.mutate(undefined, {
                                            onSuccess: () => toast.success("Belgilandi"),
                                            onError: (error) => toast.error(error.message),
                                        })
                                    }
                                >
                                    {completeHabit.isPending
                                        ? "Yuborilmoqda..."
                                        : `Bajardim · +${habit.habit.coinReward}`}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="academy-card academy-habit">
                        <small className="academy-habit-label">Bugungi yaxshi odat</small>
                        <p className="academy-quiet">Bugun odat yo‘q — dars qilib coin yig‘ishda davom et.</p>
                    </div>
                )}
            </div>

            <div className="academy-card">
                <h3>
                    Yutuqlar ({earned.length}/{achievements.length || 0})
                </h3>
                {achievementsQuery.isError ? (
                    <p className="academy-quiet">{achievementsQuery.error.message}</p>
                ) : achievements.length === 0 ? (
                    <p className="academy-quiet">Dars qil, savol yech — nishonlar shu yerda ochiladi.</p>
                ) : (
                    <div className="academy-badge-grid">
                        {[...earned, ...locked].map((item) => (
                            <div
                                key={item.code}
                                className={`academy-badge-card${item.earned ? "" : " locked"}`}
                            >
                                <span>{item.icon || "🏆"}</span>
                                <b>{item.title}</b>
                                {item.description ? <small>{item.description}</small> : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="academy-card">
                <h3>Sertifikatlar ({certificates.length})</h3>
                {certificates.length === 0 ? (
                    <p className="academy-quiet">
                        Kursni to‘liq tugatsang, birinchi sertifikating shu yerda paydo bo‘ladi.
                    </p>
                ) : (
                    <div className="academy-cert-grid">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="academy-cert">
                                <div className="academy-cert-icon">📜</div>
                                <div>
                                    <b>{cert.title}</b>
                                    {cert.verificationCode ? <small>Kod: {cert.verificationCode}</small> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
