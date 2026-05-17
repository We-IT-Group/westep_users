import {type ChangeEvent, useEffect, useRef, useState} from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import dateIcon from "../assets/icon/date.svg"

type PropsType = {
    id: string;
    label?: string;
    placeholder?: string;
    className?: string;
    value?: string;
    helperText?: string;
    error?: string;
    onValueChange?: (value: string) => void;
    onBlur?: () => void;
    manualOnly?: boolean;
};

function formatBirthdayInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseBirthdayInput(value: string) {
    const trimmedValue = value.trim();
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmedValue);

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    if (
        Number.isNaN(day) ||
        Number.isNaN(month) ||
        Number.isNaN(year) ||
        day < 1 ||
        month < 1 ||
        month > 12 ||
        year < 1900
    ) {
        return null;
    }

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function formatDateForDisplay(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}.${month}.${year}`;
}

export default function AuthDatePicker({
    id,
    label,
    placeholder,
    value = "",
    className = "",
    helperText,
    error,
    onValueChange,
    onBlur,
    manualOnly = false,
}: PropsType) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pickerRef = useRef<flatpickr.Instance | null>(null);
    const [displayValue, setDisplayValue] = useState(value);

    const inputClassName =
        `h-[48px] w-full rounded-full border bg-white/70 px-4 py-3 text-base font-medium tracking-[0.08em] text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none md:h-[54px] md:px-8 md:text-[18px] md:tracking-[0.12em] dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 ${
            error ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"
        }`;

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    useEffect(() => {
        if (manualOnly || !inputRef.current) {
            return;
        }

        const flatPickr = flatpickr(inputRef.current, {
            mode: "single",
            static: false,
            monthSelectorType: "static",
            dateFormat: "d.m.Y",
            defaultDate: parseBirthdayInput(value) ?? undefined,
            disableMobile: true,
            allowInput: true,
            clickOpens: true,
            onChange: (selectedDates) => {
                const selectedDate = selectedDates[0];

                if (!selectedDate) {
                    return;
                }

                const nextValue = formatDateForDisplay(selectedDate);
                setDisplayValue(nextValue);
                onValueChange?.(nextValue);
            },
        });

        pickerRef.current = flatPickr;

        return () => {
            flatPickr.destroy();
            pickerRef.current = null;
        };
    }, [id, manualOnly, onValueChange, value]);

    useEffect(() => {
        if (manualOnly) {
            return;
        }

        const parsedDate = parseBirthdayInput(value);

        if (!inputRef.current) {
            return;
        }

        if (!pickerRef.current) {
            return;
        }

        if (!parsedDate) {
            pickerRef.current.clear(false);
            return;
        }

        pickerRef.current.setDate(parsedDate, false, "d.m.Y");
    }, [manualOnly, value]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = formatBirthdayInput(event.target.value);
        setDisplayValue(nextValue);
        onValueChange?.(nextValue);
    };

    const handleInputBlur = () => {
        const parsedDate = parseBirthdayInput(displayValue);

        if (parsedDate) {
            const normalizedValue = formatDateForDisplay(parsedDate);
            setDisplayValue(normalizedValue);
            onValueChange?.(normalizedValue);
        }

        onBlur?.();
    };

    return (
        <div className={className}>
            {label && <label htmlFor={id}>{label}</label>}

            <div className="relative">
                <input
                    id={id}
                    ref={inputRef}
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    inputMode="numeric"
                    autoComplete="bday"
                    maxLength={10}
                    className={inputClassName}
                />

                {!manualOnly ? (
                    <button
                        type="button"
                        onClick={() => {
                            inputRef.current?.focus();
                            pickerRef.current?.open();
                        }}
                        className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 md:right-5"
                    >
                        <img src={dateIcon} alt={label || "Sana"} />
                    </button>
                ) : null}
            </div>

            {error ? (
                <p className="ml-3 mt-2 text-sm text-red-500">
                    {error}
                </p>
            ) : null}

            {helperText ? (
                <p className="ml-3 mt-2 text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
}
