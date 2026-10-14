import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveAssetUrl } from "../../api/apiClient.ts";
import {
    useGetLearningStats,
    useGetMyCertificates,
    useGetStudentCourseById,
    useGetSubjectResults,
    useGetWeeklyActivity,
} from "../../api/courses/useCourse.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import type { StudentCourse } from "../../types/types.ts";
import type { SubjectResult, WeeklyActivityDay } from "../../api/courses/statsApi.ts";
import { subjectIsland } from "./subjectStyle.ts";
import AcademyStatsNav from "./AcademyStatsNav.tsx";

const DAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const UZ_MONTHS = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
];
const UZ_MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

function localIso(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatHours(hours: number) {
    if (!Number.isFinite(hours) || hours <= 0) return "0";
    if (hours < 0.1) return "0.1";
    return hours.toFixed(1);
}

function formatCertDate(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
    return `${String(date.getDate()).padStart(2, "0")} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatWeekRange(start?: string, end?: string) {
    if (!start || !end) return "";
    const from = new Date(`${start}T00:00:00`);
    const to = new Date(`${end}T00:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return `${start} – ${end}`;
    return `${from.getDate()} ${UZ_MONTHS_SHORT[from.getMonth()]} – ${to.getDate()} ${UZ_MONTHS_SHORT[to.getMonth()]}`;
}

function dayActivity(day: WeeklyActivityDay) {
    return (
        (day.watchedMinutes || 0) +
        (day.lessonsCompleted || 0) +
        (day.quizzesCompleted || 0) +
        (day.gamesCompleted || 0)
    );
}

export default function AcademyStatistics() {
    const { data: user } = useUser();
    const [weekOffset, setWeekOffset] = useState(0);
    const { data: stats } = useGetLearningStats();
    const { data: myCourses = [] } = useGetStudentCourseById(user?.id);
    const { data: weekly, isPending: weeklyPending } = useGetWeeklyActivity(weekOffset);
    const { data: subjectResults, isPending: subjectsPending } = useGetSubjectResults();
    const { data: certificates = [], isPending: certsPending } = useGetMyCertificates();

    const subjects: SubjectResult[] = useMemo(() => {
        if (subjectResults?.items?.length) return subjectResults.items;
        return (myCourses as StudentCourse[]).map((course) => {
            const progress = course.progressPercentage ?? course.percent ?? 0;
            return {
                courseId: course.courseId,
                studentCourseId: course.id,
                courseName: course.courseName || "Fan",
                progressPercentage: progress,
                quizAverage: null,
                gameAverage: null,
                score: null,
                completedLessons: course.completedLessons || 0,
                totalLessons: course.totalLessons || 0,
                completed: progress >= 100,
            };
        });
    }, [subjectResults, myCourses]);

    const totalLessons = stats?.totalCompletedLessons ?? 0;
    const weeklyHours = formatHours(weekly?.totalHours ?? 0);
    const avgScore =
        subjectResults?.averageScore != null ? `${Math.round(subjectResults.averageScore)}%` : "—";

    const todayIso = localIso();
    const days = weekly?.days ?? [];
    const hasMinutes = days.some((day) => (day.watchedMinutes || 0) > 0);
    const maxValue = Math.max(
        1,
        ...days.map((day) => (hasMinutes ? day.watchedMinutes : dayActivity(day))),
    );
    const weekHasActivity = days.some((day) => dayActivity(day) > 0);
    const weekRange = formatWeekRange(weekly?.weekStart, weekly?.weekEnd);
    const weekSubtitle =
        weekOffset === 0
            ? weekRange
                ? `Shu hafta · ${weekRange}`
                : "Shu hafta"
            : weekRange;

    return (
        <div className="academy-stats academy-dash">
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <h2>Statistika</h2>
                    <p>Faollik, fan natijalari va sertifikatlar</p>
                </div>
                <div className="academy-dash-kpis">
                    <div className="academy-kpi">
                        <b>{weeklyHours}</b>
                        <span>soat / hafta</span>
                    </div>
                    <div className="academy-kpi ok">
                        <b>{avgScore}</b>
                        <span>o‘rtacha ball</span>
                    </div>
                    <div className="academy-kpi sun">
                        <b>{totalLessons}</b>
                        <span>tugatilgan dars</span>
                    </div>
                </div>
            </div>

            <AcademyStatsNav />

            <div className="academy-dash-main">
                <div className="academy-card academy-week">

                    <div className="academy-week-head">
                        <div>
                            <h3>Haftalik faollik</h3>
                            <p>{weekSubtitle}</p>
                        </div>
                        <div className="academy-week-nav">
                            <button
                                type="button"
                                onClick={() => setWeekOffset((value) => Math.max(-12, value - 1))}
                                aria-label="Oldingi hafta"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setWeekOffset((value) => Math.min(0, value + 1))}
                                disabled={weekOffset >= 0}
                                aria-label="Keyingi hafta"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {weeklyPending ? (
                        <div className="academy-stats-skeleton" />
                    ) : (
                        <>
                            <div className={`academy-week-bars${weekHasActivity ? "" : " empty"}`}>
                                {days.map((day, index) => {
                                    const value = hasMinutes ? day.watchedMinutes : dayActivity(day);
                                    const height = Math.max(
                                        value > 0 ? 12 : 6,
                                        Math.round((value / maxValue) * 100),
                                    );
                                    const isToday = (day.date || "") === todayIso && weekOffset === 0;
                                    return (
                                        <div
                                            key={day.date || index}
                                            className={`academy-week-col${isToday ? " today" : ""}`}
                                        >
                                            <small>
                                                {day.watchedMinutes > 0
                                                    ? String(day.watchedMinutes)
                                                    : value > 0
                                                      ? String(value)
                                                      : " "}
                                            </small>
                                            <div className="academy-week-track">
                                                <i style={{ height: `${height}%` }} />
                                            </div>
                                            <span>{DAY_LABELS[index] ?? ""}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {!weekHasActivity ? (
                                <p className="academy-week-hint">
                                    Video yoki savol yechsang, ustunlar shu yerda o‘sadi.
                                </p>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="academy-card academy-subjects-panel">
                    <h3>Fan natijalari</h3>
                    {subjectsPending ? (
                        <div className="academy-stats-skeleton" />
                    ) : subjects.length === 0 ? (
                        <div className="academy-empty-inline">
                            <b>Hali kurs yo‘q</b>
                            <p>Fanga yoziling — natijalar shu yerda chiqadi.</p>
                            <Link to="/courses" className="academy-cta academy-cta-brand academy-cta-compact">
                                Fanlarni ko‘rish
                            </Link>
                        </div>
                    ) : (
                        <div className="academy-subject-list">
                            {subjects.map((subject) => (
                                <SubjectRow key={subject.courseId} subject={subject} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="academy-card">
                <h3>Sertifikatlar</h3>
                {certsPending ? (
                    <div className="academy-stats-skeleton" />
                ) : certificates.length === 0 ? (
                    <p className="academy-quiet">
                        Kursni 100% tugatsang, birinchi sertifikating shu yerda paydo bo‘ladi.
                    </p>
                ) : (
                    <div className="academy-cert-grid">
                        {certificates.map((cert) => {
                            const color =
                                cert.color || (cert.type === "ROADMAP_STAGE" ? "#9C27B0" : "#0a5efa");
                            const typeLabel =
                                cert.type === "ROADMAP_STAGE" ? "Bosqich sertifikati" : "Kurs sertifikati";
                            const href = resolveAssetUrl(cert.downloadUrl);
                            return (
                                <div key={cert.id} className="academy-cert">
                                    <div
                                        className="academy-cert-icon"
                                        style={{ background: `${color}1A`, color }}
                                    >
                                        🎓
                                    </div>
                                    <div>
                                        <b>{cert.courseName}</b>
                                        <small>
                                            {typeLabel} · {formatCertDate(cert.issuedAt)}
                                        </small>
                                        {cert.verificationCode ? <em>Kod {cert.verificationCode}</em> : null}
                                    </div>
                                    {href ? (
                                        <a
                                            className="academy-cert-dl"
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label="Yuklab olish"
                                        >
                                            <Download size={16} />
                                        </a>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function SubjectRow({ subject }: { subject: SubjectResult }) {
    const look = subjectIsland(subject.courseName);
    const href = `/courses/${subject.courseId}/${subject.studentCourseId}`;
    return (
        <Link to={href} className={`academy-subject-row ${look.variant}`} title={subject.courseName}>
            <div className="academy-subject-emoji">{look.emoji}</div>
            <div className="academy-subject-body">
                <div className="academy-subject-top">
                    <b>{subject.courseName}</b>
                    <small>
                        {subject.completedLessons}/{subject.totalLessons} dars
                    </small>
                    {subject.score != null ? <strong>{Math.round(subject.score)}%</strong> : null}
                </div>
                <div className="academy-subject-metrics">
                    <MetricBar label="Kurs" value={subject.progressPercentage} tone="brand" />
                    <MetricBar label="Test" value={subject.quizAverage} tone="ok" />
                    <MetricBar label="O‘yin" value={subject.gameAverage} tone="sun" />
                </div>
            </div>
        </Link>
    );
}

function MetricBar({
    label,
    value,
    tone,
}: {
    label: string;
    value?: number | null;
    tone: "brand" | "ok" | "sun";
}) {
    const has = value != null;
    return (
        <div className="academy-metric">
            <span>{label}</span>
            <div className="academy-metric-track">
                <i className={tone} style={{ width: `${has ? Math.max(0, Math.min(100, value)) : 0}%` }} />
            </div>
            <em>{has ? `${Math.round(value)}%` : "—"}</em>
        </div>
    );
}
