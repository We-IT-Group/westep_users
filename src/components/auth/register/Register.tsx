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
            birthday: Yup.string().required("Tu'gilgan sanani tanlang!"),
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
            setIsPending(true);
            setTimeout(() => {
                navigate('/create-password')
                sessionStorage.setItem('form', JSON.stringify({
                    ...values,
                    phoneNumber: phoneNumber,
                    text: 'Parol yaratish'
                }));
                setIsPending(false)
            }, 500)
        },
    });

    function isOlderThan20(birthDateString: string): boolean {
        const today = new Date();
        const birthDate = new Date(birthDateString);

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

    console.log(formik.values);
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
                            <AuthDatePicker id={'birthday'} placeholder={"Tug'ilgan kun"} value={formik.values.birthday}
                                            onChange={(e: Date[]) => {
                                                const date = new Date(e[0]);
                                                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                                    .toISOString()
                                                    .split("T")[0];
                                                formik.setFieldValue('birthday', localDate, true);
                                                formik.setFieldTouched('birthday', true, false);
                                            }}/>
                            {formik.errors.birthday && formik.touched.birthday ? (
                                <p className="text-start flex text-red-600 m-0 ps-4">
                                    {formik.errors.birthday}
                                </p>
                            ) : null}

                            {needsParentPhone && (
                                <div className="mb-2 flex flex-col gap-4">
                                    {/* FEMALE */}
                                    <label
                                        className={`w-full rounded-[26px] overflow-hidden border ${formik.values.gender === "FEMALE" ? "border-blue-500" : "border-gray-400"}`}
                                    >
                                        <div
                                            className={`flex h-[48px] md:h-[54px] justify-between items-center gap-3 px-4 md:px-8 py-3 rounded-full   ${formik.values.gender === "FEMALE" ? "border-blue-500 border-b" : "border-gray-400"} `}
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
                                        className={`w-full rounded-[26px] overflow-hidden border ${formik.values.gender === "MALE" ? "border-blue-500" : "border-gray-400"}`}
                                    >
                                        <div
                                            className={`flex h-[48px] md:h-[54px] justify-between items-center gap-3 px-4 md:px-8 py-3 rounded-full   ${formik.values.gender === "MALE" ? "border-blue-500 border-b" : "border-gray-400"} `}
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
                    <p className={'text-center  mt-1'}>Akkountingiz bormi? <Link
                        className={"text-primary-600"} to="/login">Login</Link></p>
                </div>
            </section>
        </>
    );
}
