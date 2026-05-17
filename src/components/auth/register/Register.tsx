import {Link, useLocation, useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useState} from "react";
import InputField from "../../../ui/InputField.tsx";
import PhoneNumberInput from "../../../ui/PhoneNumberInput.tsx";
import AuthDatePicker from "../../../ui/AuthDatePicker.tsx";
import AuthText from "../../../ui/AuthText.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";
import AuthBrand from "../AuthBrand.tsx";

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

function toIsoDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function Register() {

    const location = useLocation();
    const navigate = useNavigate();
    const phoneNumber = location.state?.phoneNumber;

    const [isPending, setIsPending] = useState<boolean>(false);


    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            birthday: '',
            gender: 'MALE',
            parentPhone: '',
        },
        validationSchema: Yup.object().shape({
            firstName: Yup.string().required('Ism kiriting!'),
            lastName: Yup.string().required('Familiyani kiriting!'),
            birthday: Yup.string()
                .required("Tu'gilgan sanani kiriting!")
                .test(
                    "valid-birthday-format",
                    "Tug'ilgan kunni kun.oy.yil formatida kiriting!",
                    (value) => !value || parseBirthdayInput(value) !== null,
                ),
            parentPhone: Yup.string().when("birthday", ([birthday], schema) => {
                if (!birthday || isOlderThan20(birthday)) {
                    return schema.notRequired();
                }

                return schema
                    .required("Telefon raqamni kiriting!").test(
                        "is-valid-uz-number",
                        "Telefon raqami xato kiritildi!",
                        (value) => {
                            if (!value) return false;
                            const digits = value.replace(/\D/g, "");
                            return digits.startsWith("998") && digits.length === 12;
                        }
                    );
            })
        }),
        onSubmit: (values) => {
            const parsedBirthday = parseBirthdayInput(values.birthday);

            if (!parsedBirthday) {
                formik.setFieldTouched("birthday", true, true);
                return;
            }

            setIsPending(true);
            setTimeout(() => {
                navigate('/create-password')
                sessionStorage.setItem('form', JSON.stringify({
                    ...values,
                    birthDate: toIsoDateString(parsedBirthday),
                    phoneNumber: phoneNumber,
                    text: 'Parol yaratish'
                }));
                setIsPending(false)
            }, 500)
        },
    });

    function isOlderThan20(birthDateString: string): boolean {
        const birthDate = parseBirthdayInput(birthDateString);

        if (!birthDate) {
            return false;
        }

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 20;
    }

    const needsParentPhone = Boolean(
        formik.values.birthday && !isOlderThan20(formik.values.birthday)
    );

    return (
        <>
            <AuthBrand />
            <section className="flex items-center justify-center w-full">
                <div className="w-full max-w-lg animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                            return false;
                        }}
                        className="bg-transparent"
                    >
                        <AuthText title={'Ro\'yxatdan o\'tish'} body={"Yangi bilimlarga marhamat!"}/>
                        <div className="grid grid-cols-1 gap-4">
                            <InputField placeholder={'Ism'} formik={formik}
                                        type='text'
                                        name={"firstName"}
                            />
                            <InputField placeholder={'Familiya'} formik={formik}
                                        type='text'
                                        name={"lastName"}
                            />
                            <AuthDatePicker
                                id={'birthday'}
                                placeholder={"Tug'ilgan kun"}
                                value={formik.values.birthday}
                                manualOnly
                                onValueChange={(nextValue) => {
                                    formik.setFieldValue('birthday', nextValue, true);
                                }}
                                onBlur={() => {
                                    formik.setFieldTouched('birthday', true, true);
                                }}
                                error={
                                    formik.touched.birthday && formik.errors.birthday
                                        ? formik.errors.birthday
                                        : undefined
                                }
                                helperText="Format: kun.oy.yil masalan 05.09.2006"
                            />

                            {needsParentPhone && (
                                <div className="mb-2 flex flex-col gap-4">
                                    {/* FEMALE */}
                                    <label
                                        className={`w-full overflow-hidden rounded-[26px] border transition-colors ${formik.values.gender === "FEMALE" ? "border-blue-500 dark:border-blue-400" : "border-gray-300 dark:border-slate-600"}`}
                                    >
                                        <div
                                            className={`flex h-[48px] items-center justify-between gap-3 rounded-full px-4 py-3 text-slate-900 transition-colors dark:text-white md:h-[54px] md:px-8 ${formik.values.gender === "FEMALE" ? "border-b border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-500/10" : "bg-white/50 dark:bg-white/5"} `}
                                        >
                                            <p className="text-lg">Onam</p>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="FEMALE"
                                                className="scale-[1.8]"
                                                checked={formik.values.gender === "FEMALE"}
                                                onChange={formik.handleChange}
                                            />
                                        </div>

                                        {/* PHONE WRAPPER */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out  ${formik.values.gender === "FEMALE"
                                                ? "max-h-[60px] opacity-100 translate-y-0"
                                                : "max-h-0 opacity-0 -translate-y-2"} `}
                                        >
                                            <PhoneNumberInput
                                                name="parentPhone"
                                                formik={formik}
                                                className="border-0 w-full"
                                            />
                                        </div>
                                    </label>

                                    {/* MALE */}

                                    <label
                                        className={`w-full overflow-hidden rounded-[26px] border transition-colors ${formik.values.gender === "MALE" ? "border-blue-500 dark:border-blue-400" : "border-gray-300 dark:border-slate-600"}`}
                                    >
                                        <div
                                            className={`flex h-[48px] items-center justify-between gap-3 rounded-full px-4 py-3 text-slate-900 transition-colors dark:text-white md:h-[54px] md:px-8 ${formik.values.gender === "MALE" ? "border-b border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-500/10" : "bg-white/50 dark:bg-white/5"} `}
                                        >
                                            <p className="text-lg">Otam</p>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="MALE"
                                                className="scale-[1.8]"
                                                checked={formik.values.gender === "MALE"}
                                                onChange={formik.handleChange}
                                            />
                                        </div>

                                        {/* PHONE WRAPPER */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out  ${formik.values.gender === "MALE"
                                                ? "max-h-[60px] opacity-100 translate-y-0"
                                                : "max-h-0 opacity-0 -translate-y-2"} `}
                                        >
                                            <PhoneNumberInput
                                                name="parentPhone"
                                                formik={formik}
                                                className="border-0 w-full"
                                            />
                                        </div>
                                    </label>

                                </div>
                            )}
                        </div>



                        <div className="mt-8 w-full">
                            <CommonButton
                                type="submit"
                                children={"Davom etish"}
                                variant="primary"
                                isPending={isPending}
                                disabled={!(formik.isValid && formik.dirty)}
                            />
                        </div>
                    </form>
                    <p className="mt-1 text-center text-slate-600 dark:text-slate-300">Akkountingiz bormi? <Link
                        className="text-primary-600 dark:text-blue-400" to="/login">Login</Link></p>
                </div>
            </section>
        </>
    );
}
