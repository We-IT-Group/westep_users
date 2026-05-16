import {useEffect} from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import dateIcon from "../assets/icon/date.svg"
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
    id: string;
    mode?: "single" | "multiple" | "range" | "time";
    onChange?: Hook | Hook[];
    defaultDate?: DateOption;
    label?: string;
    placeholder?: string;
    className?: string;
    value?: string;
};

export default function AuthDatePicker({
                                           id,
                                           mode,
                                           onChange,
                                           label,
                                           defaultDate,
                                           placeholder,
                                           value,
                                       }: PropsType) {
    const inputClassName =
        "h-[48px] w-full rounded-full border border-gray-300 bg-white/70 px-4 py-3 text-[16px] text-lg text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none md:h-[54px] md:px-8 md:text-[18px] dark:border-slate-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500";

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        const flatPickr = flatpickr(`#${id}`, {
            mode: mode || "single",
            static: false,
            monthSelectorType: "static",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d.m.Y",
            defaultDate: value || defaultDate,
            onChange,
            altInputClass: inputClassName,
            disableMobile: true,
            allowInput: !isMobile, // Mobilda faqat kalendar ochilsin
            clickOpens: true,
        });

        return () => {
            if (!Array.isArray(flatPickr)) {
                flatPickr.destroy();
            }
        };
    }, [mode, onChange, id, defaultDate, value]);

    return (
        <div>
            {label && <label htmlFor={id}>{label}</label>}

            <div className="relative">
                <input
                    id={id}
                    placeholder={placeholder}
                    className={inputClassName}
                />

                <span
                    className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
          <img src={dateIcon} alt={label}/>
        </span>
            </div>
        </div>
    );
}
