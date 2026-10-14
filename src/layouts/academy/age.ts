export function yearsFromBirthDate(birthDate?: string | null): number | null {
    if (!birthDate) return null;

    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age -= 1;
    }

    return age;
}

export function ageChipLabel(birthDate?: string | null): string {
    const age = yearsFromBirthDate(birthDate);
    if (age == null) return "5–17";
    if (age <= 12) return "5–12";
    return "13–17";
}

export function isTeenAge(birthDate?: string | null): boolean {
    const age = yearsFromBirthDate(birthDate);
    return age != null && age >= 13;
}
