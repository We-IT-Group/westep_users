import {Link, useLocation, useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useState} from "react";
import InputField from "../../../ui/InputField.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";

export default function Register() {

    const location = useLocation();
    const navigate = useNavigate();
    const phoneNumber = location.state?.phoneNumber;

    const [isPending, setIsPending] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
        },
        validationSchema: Yup.object().shape({
            firstName: Yup.string().required('Ism kiriting!'),
            lastName: Yup.string().required('Familiyani kiriting!'),
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

    return (
        <section className="w-full">
            <h2>Ro‘yxat</h2>
            <p className="sub">1 / 2 qadam · keyin parol qo‘yamiz</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                    return false;
                }}
            >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                    <div>
                        <label htmlFor="firstName">Ism</label>
                        <InputField
                            placeholder={'Ism'}
                            formik={formik}
                            type='text'
                            name={"firstName"}
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName">Familya</label>
                        <InputField
                            placeholder={'Familiya'}
                            formik={formik}
                            type='text'
                            name={"lastName"}
                        />
                    </div>
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
            <p className="mt-4 text-center font-bold text-[#6b7c99]">
                Akkountingiz bormi? <Link className="text-[#0a5efa]" to="/login">Kirish</Link>
            </p>
        </section>
    );
}
