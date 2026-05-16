import PhoneInput from "react-phone-number-input/min";
import {FormikProps} from "formik";
import {FlagUz} from "../assets/icon";


interface IPhoneNumberInputProps<T> {
    label?: string;
    name: keyof T;
    formik: FormikProps<T>,
    className: string
}

const PhoneNumberInput = <T extends Record<string, any>>({
                                                             label = "",
                                                             name,
                                                             formik,
                                                             className = "",
                                                         }: IPhoneNumberInputProps<T>) => {


    return (
        <div className={`${className} mb-3 w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="text-sm font-semibold text-slate-500 dark:text-slate-400"
                >
                    {label}
                </label>
            )}

            <PhoneInput
                defaultCountry="UZ"
                value={formik.values[name] ? `+${formik.values[name] as string}` : ""}
                onChange={(e) => {
                    formik.setFieldValue(name as string, e?.replace("+", ""));
                }}
                maxLength={17}
                international
                countryCallingCodeEditable={true}
                countrySelectComponent={() => (
                    <span style={{pointerEvents: 'none', display: 'flex', alignItems: 'center',marginRight:'10px'}}>
      <FlagUz width={24} height={24}/>
    </span>
                )}
                className={`${className} auth-phone-input mb-3 w-full rounded-full bg-white/70 px-4 py-3 text-lg text-slate-900 dark:bg-white/5 dark:text-white md:px-8`}
            />

            {formik.errors[name] && formik.touched[name] ? (
                <p className="ml-2 mt-2 text-sm text-red-500">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default PhoneNumberInput;
