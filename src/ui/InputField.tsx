import eye from "../assets/icon/eye.svg"
import eyeSlash from "../assets/icon/eye-slash.svg"
import {useState} from "react";
import {FormikProps} from "formik";


type InputFieldProps<T> = {
    label?: string;
    type?: string;
    name: keyof T;
    formik: FormikProps<T>;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
};


const InputField = <T extends Record<string, any>>({
                                                       label = "",
                                                       type = "text",
                                                       name,
                                                       formik,
                                                       placeholder,
                                                       icon = null,
                                                       className = "",
                                                       ...rest
                                                   }: InputFieldProps<T>) => {


    const [changeType, setChangeType] = useState<string>(type);

    return (
        <div className={`${className}  w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                </label>
            )}

            <div className="relative w-full block">
                <input
                    type={changeType}
                    id={name as string}
                    name={name as string}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={placeholder}
                    className="h-[48px] w-full rounded-full border border-gray-300 bg-white/70 px-4 py-3 text-[16px] text-lg text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none md:h-[54px] md:px-8 md:text-[18px] dark:border-slate-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                    {...rest}
                />



                {type === "password" && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 dark:text-slate-400">
            {changeType === "text" ? (
                <img
                    onClick={() => setChangeType("password")}
                    src={eye}
                    width={22}
                    height={22}
                    alt="hide_password"
                />
            ) : (
                <img
                    onClick={() => setChangeType("text")}
                    src={eyeSlash}
                    width={22}
                    height={22}
                    alt="show_password"
                />
            )}
          </span>
                )}
            </div>

            {formik.errors[name] && formik.touched[name] ? (
                <p className="ml-3 mt-2 text-sm text-red-500">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default InputField;
