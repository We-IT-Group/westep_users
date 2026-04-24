export const animationCreate = () => {
    if (typeof window !== "undefined") {
        import("wowjs").then((module) => {
            const WOW = module.default;
            new WOW.WOW({live: false}).init()
        });
    }
};

import {useEffect} from "react";

export const useWowAnimation = () => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("wowjs").then((module) => {
                const WOW = module.default;
                setTimeout(() => {
                    new WOW({live: false}).init();
                }, 100); // Adjust delay if necessary
            });
        }
    }, []);
};

export const setItem = <T>(name: string, data: T): void => {
    localStorage.setItem(name, JSON.stringify(data));
};

export const getItem = <T>(name: string): T | null => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) as T : null;
};


export const removeItem = (name: string): void => {
    localStorage.removeItem(name);
};

export function formatUzPhone(number:string) {
    // Faqat raqamlarni qoldiramiz
    const digits = number.replace(/\D/g, "");

    // 13 ta raqam bo'lishi kerak: 998 XX XXX XX XX
    if (digits.length !== 12 && digits.length !== 9) {
        return "+998 " + digits;
    }

    // Agar user faqat 20 008 08 08 kiritgan bo'lsa
    let d = digits;
    if (digits.length === 9) {
        d = "998" + digits;
    }

    const country = d.slice(0, 3);
    const code = d.slice(3, 5);
    const part1 = d.slice(5, 8);
    const part2 = d.slice(8, 10);
    const part3 = d.slice(10, 12);

    return `+${country} ${code} ${part1} ${part2} ${part3}`;
}

export function formatCourseDuration(totalSeconds?: number | null) {
    if (!totalSeconds) return null;
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours} soat ${remainingMinutes} min` : `${hours} soat`;
    }
    
    return seconds > 0 ? `${minutes} min ${seconds} sek` : `${minutes} min`;
}