import { Link } from "react-router-dom";
import { useGetLearningStats, useGetSubjectResults, useGetWeeklyActivity } from "../../api/courses/useCourse.ts";
import { subjectIsland, type IslandVariant } from "./subjectStyle.ts";

export type HomeIsland = {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    variant?: IslandVariant;
    emoji?: string;
};

export type HomeContinue = {
    title: string;
    lessonTitle: string;
    href: string;
    progress: number;
    image?: string;
};

type AcademyHomeProps = {
    teen: boolean;
    continueLearning: HomeContinue | null;
    islands: HomeIsland[];
    pathTitle?: string;
    pathTotal?: number;
    pathCurrent?: number;
};

export default function AcademyHome({
    teen,
    continueLearning,
    islands,
    pathTitle,
    pathTotal = 0,
    pathCurrent = 0,
}: AcademyHomeProps) {
    const nodes = Math.min(Math.max(pathTotal, 0), 8) || (continueLearning ? 8 : 0);
    const currentIndex = nodes > 0 ? Math.min(Math.max(pathCurrent, 0), nodes - 1) : 0;

    return (
        <div className={teen ? "academy-teen" : ""}>
            <div className="academy-hero">
                {continueLearning ? (
                    <Link to={continueLearning.href} className="academy-hero-card">
                        {continueLearning.image ? (
                            <img className="bg" src={continueLearning.image} alt="" />
                        ) : (
                            <img className="bg" src="/academy/stage.jpg" alt="" />
                        )}
                        <div className="veil" />
                        <div className="academy-hero-body">
                            <div>
                                <span className="academy-kicker">Davom ettirish · {continueLearning.title}</span>
                                <h2>{continueLearning.lessonTitle}</h2>
                                <div className="next">Video yo‘q bo‘lsa ham savollar ochiq</div>
                            </div>
                            <div className="academy-progress">
                                <div className="academy-bar">
                                    <i style={{ width: `${continueLearning.progress}%` }} />
                                </div>
                                <b>{continueLearning.progress}%</b>
                                <div className="academy-play">▶</div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link to="/courses" className="academy-hero-card">
                        <img className="bg" src="/academy/stage.jpg" alt="" />
                        <div className="veil" />
                        <div className="academy-hero-body">
                            <div>
                                <span className="academy-kicker">Boshlash</span>
                                <h2>O‘zingga fan tanla</h2>
                                <div className="next">Fanlar ochiq — birinchisini boshlaymiz</div>
                            </div>
                            <span className="academy-cta">Fanlarni ko‘rish</span>
                        </div>
                    </Link>
                )}

                <div className="academy-westy-card">
                    <img src="/academy/westy.png" alt="Westy" />
                    <h3>Westy bilan yur</h3>
                    <p>
                        {teen
                            ? "Bugungi darsni yopib, savollarni yech."
                            : "3 ta yulduz yig‘sang, sandiq ochiladi!"}
                    </p>
                    <div className="academy-gift">
                        {teen ? "Seriyani saqlab qol" : "Kunlik sovg‘a 🎁 ochilmagan"}
                    </div>
                </div>
            </div>

            {islands.length > 0 ? (
                <div className="academy-islands">
                    {islands.slice(0, 4).map((island) => {
                        const look = subjectIsland(island.title);
                        return (
                            <Link
                                key={island.id}
                                to={island.href}
                                className={`academy-island ${island.variant || look.variant}`}
                            >
                                <div className="emoji">{island.emoji || look.emoji}</div>
                                <div>
                                    <h3>{island.title}</h3>
                                    <small>{island.subtitle}</small>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : null}

            {nodes > 0 ? (
                <div className="academy-path-wrap">
                    <h3>{pathTitle || "Dars yo‘li"}</h3>
                    <div className="academy-path">
                        {Array.from({ length: nodes }).map((_, index) => (
                            <div key={index} style={{ display: "contents" }}>
                                <div
                                    className={`academy-node ${
                                        index < currentIndex ? "done" : index === currentIndex ? "now" : "lock"
                                    }`}
                                >
                                    {index < currentIndex ? "✓" : index + 1}
                                </div>
                                {index < nodes - 1 ? (
                                    <div className={`academy-link${index < currentIndex ? " done" : ""}`} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <HomeStatsStrip />

            <div className="academy-grid-2" style={{ marginTop: 18 }}>
                <div className="academy-card">
                    <h3>Uy vazifasi</h3>
                    <Link to="/homework-history" className="academy-row">
                        <b>Yuborilgan ishlar</b>
                        <span className="academy-badge wait">ochish</span>
                    </Link>
                    <Link to="/musobaqa" className="academy-row">
                        <b>Haftalik musobaqa</b>
                        <span className="academy-badge play">qatnash</span>
                    </Link>
                </div>
                <div className="academy-card">
                    <h3>Savollar</h3>
                    <Link to="/quiz-history" className="academy-row">
                        <b>Oldingi savollar</b>
                        <span className="academy-badge ok">natija</span>
                    </Link>
                    {continueLearning ? (
                        <Link to={continueLearning.href} className="academy-row">
                            <b>Shu dars savollari</b>
                            <span className="academy-badge play">hozir</span>
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function formatHours(hours?: number) {
    if (!hours || hours <= 0) return "0";
    if (hours < 0.1) return "0.1";
    return hours.toFixed(1);
}

function HomeStatsStrip() {
    const { data: stats } = useGetLearningStats();
    const { data: weekly } = useGetWeeklyActivity(0);
    const { data: subjects } = useGetSubjectResults();
    const hours = formatHours(weekly?.totalHours);
    const avg =
        subjects?.averageScore != null ? `${Math.round(subjects.averageScore)}%` : "—";
    const lessons = stats?.totalCompletedLessons ?? 0;

    return (
        <Link to="/statistics" className="academy-stat-row academy-stat-link">
            <div className="academy-stat-tile">
                <b>{hours}</b>
                <span>soat / hafta</span>
            </div>
            <div className="academy-stat-tile ok">
                <b>{avg}</b>
                <span>o‘rtacha ball</span>
            </div>
            <div className="academy-stat-tile sun">
                <b>{lessons}</b>
                <span>tugatilgan dars</span>
            </div>
        </Link>
    );
}
