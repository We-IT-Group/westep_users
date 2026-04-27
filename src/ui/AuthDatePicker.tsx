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
                    className={`w-full h-[48px] md:h-[54px] rounded-full border border-gray-400 bg-transparent text-[16px] md:text-[18px] px-4 md:px-8 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none  focus:border-brand-500`}
                />

                <span
                    className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-6 top-1/2 dark:text-gray-400">
          <img src={dateIcon} alt={label}/>
        </span>
            </div>
        </div>
    );
}
