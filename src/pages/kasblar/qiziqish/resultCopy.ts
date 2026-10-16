export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

/** Har olamning rangi uning loy rasmiga mos — natijada bir xil rang orqali taniladi. */
export const RIASEC_COPY: Record<RiasecKey, { title: string; color: string; image: string; blurb: string }> = {
    R: {
        title: "Usta olami",
        color: "#16A34A",
        image: "/quiz/r.webp",
        blurb: "Qo'ling bilan yasash, tuzatish, harakat qilish senga zavq beradi. Natijasi ko'rinadigan ishlar — sening kuching.",
    },
    I: {
        title: "Kashfiyotchi olami",
        color: "#4F46E5",
        image: "/quiz/i.webp",
        blurb: "\"Nega?\" va \"Qanday ishlaydi?\" degan savollar seni o'ziga tortadi. Tajriba, kuzatish va mantiq — sening yo'ling.",
    },
    A: {
        title: "Ijodkor olami",
        color: "#DB2777",
        image: "/quiz/a.webp",
        blurb: "Chizish, musiqa, hikoya, yangi g'oya — sen dunyoni o'zingcha ko'rsata olasan. Erkin ijod seni ilhomlantiradi.",
    },
    S: {
        title: "Yordamchi olami",
        color: "#EA580C",
        image: "/quiz/s.webp",
        blurb: "Odamlarga yordam berish, o'rgatish, qo'llab-quvvatlash senga yoqadi. Atrofingdagilar sen bilan o'zini yaxshi his qiladi.",
    },
    E: {
        title: "Yetakchi olami",
        color: "#D97706",
        image: "/quiz/e.webp",
        blurb: "Jamoani boshqarish, g'oyani himoya qilish, maqsadga erishish seni ruhlantiradi. Sen tashabbus ko'rsatishni yaxshi ko'rasan.",
    },
    C: {
        title: "Tartib olami",
        color: "#0D9488",
        image: "/quiz/c.webp",
        blurb: "Reja, tartib va aniqlik senga yoqadi. Ishni bosqichma-bosqich, puxta bajarish — sening ustunliging.",
    },
};

export function riasecCopy(key: string) {
    return RIASEC_COPY[key as RiasecKey] ?? null;
}

/** Fan va soha kalitlari ikonkasi (natija va moslikda). */
export const SUBJECT_EMOJI: Record<string, string> = {
    "subject.biology": "🧬",
    "subject.chemistry": "⚗️",
    "subject.physics": "🧲",
    "subject.math": "➗",
    "subject.languages": "🗣️",
    "subject.history": "📜",
    "subject.informatics": "💻",
    "subject.economics": "📈",
    "subject.geography": "🌍",
    "subject.literature": "📖",
    "field.medicine": "🩺",
    "field.engineering": "🏗️",
    "field.it": "👩‍💻",
    "field.law": "⚖️",
    "field.business": "💼",
    "field.education": "👩‍🏫",
    "field.arts": "🎨",
    "field.science": "🔬",
};

/** Profil kaliti bo'yicha bir gaplik amaliy maslahat. */
export const PROFILE_TIPS: Record<string, string> = {
    "subject.biology": "Tabiat va odam tanasi haqidagi kitob va videolar bilan qiziqishingni o'stir.",
    "subject.chemistry": "Uyda xavfsiz kichik tajribalar va kimyo to'garagi yaxshi boshlanish.",
    "subject.physics": "\"Bu qanday ishlaydi?\" degan savolga javob qidirib, oddiy tajribalar qilib ko'r.",
    "subject.math": "Har kuni bitta qiziqarli masala yech — mantiq kuchayadi.",
    "subject.languages": "Kuniga 5 ta yangi so'z va sevimli multfilmni chet tilida ko'rish yordam beradi.",
    "subject.history": "Tarixiy joylarga sayohat va tarixiy kitoblar qiziqishingni oshiradi.",
    "subject.informatics": "Scratch yoki oddiy dasturlash darslaridan boshlab ko'r.",
    "subject.economics": "Cho'ntak pulingni rejalashtirib ko'r — bu iqtisodning birinchi darsi.",
    "subject.geography": "Xarita bilan o'yna, turli mamlakatlar haqida bilib ol.",
    "subject.literature": "Ko'p o'qi va o'qiganing haqida qisqa fikr yoz.",
    "field.medicine": "Birinchi yordam asoslarini o'rgan, biologiya va kimyoga e'tibor ber.",
    "field.engineering": "Konstruktor, maket va robototexnika to'garagi seni rivojlantiradi.",
    "field.it": "O'yin yoki sayt yaratish bo'yicha boshlang'ich kursni sinab ko'r.",
    "field.law": "Munozara klubiga qatnash, qoidalar nega kerakligi haqida o'yla.",
    "field.business": "Kichik loyiha yoki yarmarkada savdo qilib ko'r.",
    "field.education": "Kichiklarga biror narsani o'rgatib ko'r — bu katta tajriba.",
    "field.arts": "Har kuni biroz chiz, kuyla yoki yarat — ijod mashq bilan o'sadi.",
    "field.science": "Kuzatuv daftari tut: nimani ko'rding, nima deb o'ylading.",
    "strength.logic": "Mantiqiy o'yinlar, shaxmat va masalalar bu kuchni yanada o'stiradi.",
    "strength.creativity": "G'oyalaringni daftarga yozib bor — keyin ulardan loyiha chiqadi.",
    "strength.communication": "To'garakda yoki sinfda kichik taqdimot qilib ko'r.",
    "strength.teamwork": "Jamoaviy loyihalarda rol olishdan qo'rqma — bu sening maydoning.",
    "strength.independence": "O'zing boshlab, o'zing tugatadigan kichik loyiha tanla.",
    "strength.focus": "Uzoq vazifani bo'laklarga bo'l — diqqating senga yordam beradi.",
    "learn.visual": "Sxema, rasm va videolar bilan o'rgan; konspektga rang qo'sh.",
    "learn.auditory": "Mavzuni ovoz chiqarib tushuntirib ko'r yoki audio darslarni tingla.",
    "learn.kinesthetic": "Qilib ko'rib o'rgan: tajriba, modellar, amaliy topshiriqlar.",
    "learn.reading": "Kitob va maqolalardan o'qib, qisqa xulosa yozib bor.",
    "learn.solo": "Tinch joyda yakka o'qish senga ko'proq natija beradi.",
    "learn.group": "Do'stlar bilan birga o'qish va muhokama qilish senga mos.",
    "value.help": "Odamlarga foyda keltiradigan kasblar senga ma'no beradi.",
    "value.creativity": "Har kuni yangi narsa yaratiladigan ish seni zeriktirmaydi.",
    "value.money": "Mehnatingning natijasini aniq ko'rish sen uchun muhim.",
    "value.independence": "O'z qarorlaringni o'zing qabul qila oladigan ish senga yoqadi.",
    "value.recognition": "Mehnating ko'rinib, qadrlanadigan joyda sen gullaysan.",
    "value.stability": "Aniq, ishonchli va barqaror ish sen uchun qadrli.",
};

const MOOD_PHRASES: Record<string, [string, string, string]> = {
    "mood.energy": ["Hozir biroz charchagandeksan", "Energiyang yetarli", "Energiyang a'lo"],
    "mood.confidence": ["O'zingga ishonchni biroz qo'llab-quvvatlash kerak", "O'zingga ishonching yaxshi", "O'zingga ishonching kuchli"],
    "mood.calm": ["Oxirgi kunlar biroz tashvishli o'tgan ko'rinadi", "Ko'nglingda xotirjamlik bor", "Ko'ngling juda xotirjam"],
    "mood.social": ["Do'stlar bilan ko'proq vaqt o'tkazish yoqishi mumkin", "Do'stlaring bilan aloqang yaxshi", "Do'stlaring bilan aloqang ajoyib"],
};

export function moodPhrase(key: string, score: number) {
    const phrases = MOOD_PHRASES[key];
    if (!phrases) return "";
    return phrases[score >= 70 ? 2 : score >= 40 ? 1 : 0];
}

/** Moslik darajasi — hukm emas, yo'nalish: rang va qisqa so'z. */
export function fitTone(fit: number) {
    if (fit >= 70) return { label: "Juda mos", color: "#10B981", soft: "bg-emerald-50 text-emerald-700" };
    if (fit >= 40) return { label: "Mos", color: "#2563EB", soft: "bg-blue-50 text-blue-700" };
    return { label: "Kam mos", color: "#94A3B8", soft: "bg-slate-100 text-slate-600" };
}

export const TIER_INFO: Record<number, { title: string; minutes: number; note: string }> = {
    50: { title: "Tezkor", minutes: 10, note: "Umumiy yo'nalishni ko'rsatadi." },
    100: { title: "Standart", minutes: 20, note: "Kasb olamlari va kuchli tomonlaringni aniqroq ko'rsatadi." },
    200: { title: "To'liq", minutes: 40, note: "Eng batafsil profil: barcha o'lchamlar chuqur o'rganiladi." },
};
