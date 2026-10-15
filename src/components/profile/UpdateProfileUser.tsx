import {User} from "../../types/types.ts";
import {useEffect, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import NewInput from "../../ui/NewInput.tsx";
import Button from "../../ui/Button.tsx";
import PhoneNumberInput from "../../ui/PhoneNumberInput.tsx";
import {useUpdateProfile} from "../../api/auth/useAuth.ts";


interface Props {
    user: User;
    setEdit: (edit: boolean) => void;
}

interface UpdateProfileForm {
    phoneNumber: string;
    firstname: string;
    lastname: string;
    birthDate: string;
    roleName: string;
    gender: "MALE" | "FEMALE";
}

function UpdateProfileUser({user, setEdit}: Props) {

    const {mutateAsync, isPending} = useUpdateProfile();

    const [initialValues, setInitialValues] = useState<UpdateProfileForm>({
        firstname: "",
        lastname: "",
        gender: "MALE",
        phoneNumber: '',
        birthDate: '',
        roleName: 'STUDENT',
    });


    useEffect(() => {
        if (user) {
            setInitialValues({
                firstname: user.firstname,
                lastname: user.lastname,
                gender: user.gender === "FEMALE" ? "FEMALE" : "MALE",
                phoneNumber: user.phoneNumber,
                birthDate: user.birthDate || '',
                roleName: user.roleName || "STUDENT",
            })
        }
    }, [user]);

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            firstname: Yup.string()
                .required("Ismni kiriting!"),
            lastname: Yup.string()
                .required("Familiyani kiriting!"),
            phoneNumber: Yup.string()
                .required("Telefon raqamni kiriting!"),
        }),
        onSubmit: async (values) => {
            await mutateAsync(values);
            setEdit(false);
        },
    });

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                    return false;
                }}
                className={'mt-5 flex flex-col justify-between'}>
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <NewInput type="text" label={'Ism'} formik={formik} name="firstname" placeholder="Ism"/>
                        <hr className={'border-gray-100 mt-3'}/>
                    </div>
                    <div>
                        <NewInput type="text" label={'Familiya'} formik={formik} name="lastname"
                                  placeholder="Familiya"/>
                        <hr className={'border-gray-100 mt-3'}/>
                    </div>
                    <div>
                        <PhoneNumberInput formik={formik} label={'Telefon raqam'} name="phoneNumber"
                                          className={'outline-hidden w-full text-md text-gray-900 font-semibold border-none p-0'}/>
                        <hr className={'border-gray-100 mt-3'}/>
                    </div>
                </div>

                <div className="mt-3 flex gap-6 justify-end">
                    <Button
                        className={'flex items-center justify-center gap-2 bg-primary-500 text-md font-extrabold text-white w-full p-[10px] rounded-2xl'}
                        type="submit"
                        variant="primary"
                        isPending={isPending}
                        disabled={isPending}
                    >
                        Saqlash
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default UpdateProfileUser;
