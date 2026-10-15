import {useCheckPhoneNumber} from "../../../api/auth/useAuth.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import PhoneNumberInput from "../../../ui/PhoneNumberInput.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";
// import TelegramLoginButton from "../telegram/TelegramLoginButton.tsx";
import {clearPostAuthRedirect, setPostAuthRedirect} from "../../../utils/postAuthRedirect.ts";


export default function LoginForm() {
    const location = useLocation();
    const {mutateAsync, isPending} = useCheckPhoneNumber();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nextPath = params.get("next");

        if (nextPath && !nextPath.includes("tgAuthResult")) {
            setPostAuthRedirect(nextPath);
        } else if (location.pathname === "/login") {
            clearPostAuthRedirect();
        }
    }, [location.pathname, location.search]);

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
        <section className="w-full">
            <h2>Kirish</h2>
            <p className="sub">Telefon raqamingni yoz. Agar yangi bo‘lsang, ro‘yxatdan o‘tamiz.</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                }}
            >
                <label htmlFor="phone">Telefon</label>
                <PhoneNumberInput name="phone" formik={formik} className="" />
                <CommonButton
                    type="submit"
                    children="Davom etish"
                    variant="primary"
                    isPending={isPending}
                    disabled={!(formik.isValid && formik.dirty)}
                />
            </form>
            {/* Telegram orqali kirish vaqtincha yashirildi */}
            {/* <div className="academy-or">yoki</div>
            <div className="academy-social">
                <TelegramLoginButton />
            </div> */}
        </section>
    );
}
