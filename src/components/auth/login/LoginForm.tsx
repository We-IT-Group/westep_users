import {useCheckPhoneNumber} from "../../../api/auth/useAuth.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import PhoneNumberInput from "../../../ui/PhoneNumberInput.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";
import AuthText from "../../../ui/AuthText.tsx";
import westepLogo from "../../../assets/westep_dark_logo.png";


export default function LoginForm() {

    const {mutateAsync, isPending} = useCheckPhoneNumber();


    const formik = useFormik({
        initialValues: {
            phone: ''
        },
        validationSchema: Yup.object().shape({
            phone: Yup.string()
                .required("Telefon raqami xato kiritildi!")
                .length(12, "Telefon raqami xato kiritildi!"),
        }),
        onSubmit: async (values) => {
            sessionStorage.setItem("form", JSON.stringify({phoneNumber: values.phone}));
            await mutateAsync({phoneNumber: values.phone});
        },
    });

    return (
        <>
            <div className='mb-4 flex justify-center'>
                <img src={westepLogo} width={220} alt="Westep"/>
            </div>
            <section className="flex items-center justify-center w-full">
                <div className="w-full max-w-lg animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                        className="bg-transparent"
                    >
                        <AuthText body='Bilimingizni yangi bosqichga olib chiqing!'/>

                        <div className="space-y-6">
                            <PhoneNumberInput name="phone" formik={formik} className=""/>
                        </div>

                        <div className="mt-8 w-full">
                            <CommonButton
                                type="submit"
                                children={"Kirish"}
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
