import { useFormik } from "formik";
import * as Yup from "yup";
import { useOtpPhoneNumber } from "../../../api/auth/useAuth.ts";
import InputField from "../../../ui/InputField.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";
import AuthText from "../../../ui/AuthText.tsx";
import PasswordRequirements from "../../../ui/PasswordRequirements.tsx";
import AuthBrand from "../AuthBrand.tsx";


export default function NewPassword() {

    const form = JSON.parse(sessionStorage.getItem('form') as string);
    const { mutate, isPending } = useOtpPhoneNumber('REGISTER')

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object().shape({
            password: Yup.string()
                .required("Parolni kiriting!")
                .matches(/[A-Z]/, "Kamida bitta katta harf bo‘lishi kerak")
                .matches(/[a-z]/, "Kamida bitta kichik harf bo‘lishi kerak")
                .matches(/\d/, "Kamida bitta raqam bo‘lishi kerak")
                .min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak"),
            confirmPassword: Yup.string()
                .required("Parolni kiriting!")
                .oneOf([Yup.ref("password")], "Parollar bir xil bo‘lishi kerak!"),
        }),
        onSubmit: (values) => {
            console.log(values)
            sessionStorage.setItem('form', JSON.stringify({
                ...form, password: values.password,
            }));
            mutate({ phoneNumber: form.phoneNumber, type: 'REGISTER' })
        },
    });

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
                        <AuthText title="Parol yaratish" />
                        <div className="grid grid-cols-1 mt-2 gap-3">
                            <InputField
                                name="password" label="" placeholder={'Yangi parol'} type="password"
                                key='passwords' formik={formik}
                            />
                            <PasswordRequirements password={formik.values.password} />
                            <InputField
                                name="confirmPassword" label="" placeholder={'Parol tasdig’i'} type="password"
                                key='password' formik={formik}
                            />
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
                </div>
            </section>
        </>
    );
}
