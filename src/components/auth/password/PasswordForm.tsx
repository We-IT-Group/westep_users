import { useState } from "react";
import { DeviceLimitExceededDetails, isDeviceLimitExceededError } from "../../../api/auth/authApi.ts";
import { useLogin } from "../../../api/auth/useAuth.ts";
import 'react-phone-number-input/style.css';
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useLocation } from "react-router-dom";
import InputField from "../../../ui/InputField.tsx";
import CommonButton from "../../../ui/CommonButton.tsx";
import AuthText from "../../../ui/AuthText.tsx";
import PasswordRequirements from "../../../ui/PasswordRequirements.tsx";
import DeviceLimitModal from "./DeviceLimitModal.tsx";
import { deleteMyDevice } from "../../../api/device/deviceApi.ts";


export default function PasswordForm() {

    const location = useLocation();
    const phone = location.state?.phoneNumber;
    const { mutateAsync, isPending } = useLogin();
    const [deviceLimitDetails, setDeviceLimitDetails] = useState<DeviceLimitExceededDetails | null>(null);
    const [deviceActionError, setDeviceActionError] = useState("");
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
    const [replacingSessionId, setReplacingSessionId] = useState<string | null>(null);

    async function submitLogin(password: string, replaceSessionId?: string) {
        if (!phone) {
            throw new Error("Telefon raqami topilmadi");
        }

        try {
            await mutateAsync({
                phoneNumber: phone,
                password,
                replaceSessionId,
            });
            setDeviceLimitDetails(null);
            setDeviceActionError("");
            return true;
        } catch (error) {
            if (isDeviceLimitExceededError(error)) {
                setDeviceLimitDetails(error.details);
                setDeviceActionError("");
                return false;
            }

            throw error;
        }
    }

    const formik = useFormik({
        initialValues: {
            password: ''
        },
        validationSchema: Yup.object().shape({
            password: Yup.string()
                .required("Parolni kiriting!")
                // .matches(/[A-Z]/, "Kamida bitta katta harf bo‘lishi kerak")
                .matches(/[a-z]/, "Kamida bitta kichik harf bo‘lishi kerak")
                .matches(/\d/, "Kamida bitta raqam bo‘lishi kerak")
                .min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak!"),
        }),
        onSubmit: async (values, { setFieldError, setFieldTouched }) => {
            try {
                await submitLogin(values.password);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Parol noto'g'ri kiritildi!";
                setFieldTouched("password", true, false);
                setFieldError("password", message);
            }
        },
    });

    return (
        <>
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
                        <AuthText title={'Kirish'} />
                        <div className="grid grid-cols-1 mt-2">
                            <InputField
                                placeholder="Parolni kiriting!"
                                formik={formik}
                                type="password"
                                name="password"
                            />
                            <PasswordRequirements password={formik.values.password} />
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
                    <p className={'text-center text-gray-900 mt-2'}><Link
                        className={"text-gray-800"} to="/forgot-password">Parolni unutdingizmi?</Link></p>
                </div>
            </section>
            {deviceLimitDetails ? (
                <DeviceLimitModal
                    details={deviceLimitDetails}
                    isDeletingSessionId={deletingSessionId}
                    isReplacingSessionId={replacingSessionId}
                    errorMessage={deviceActionError}
                    onClose={() => {
                        setDeviceLimitDetails(null);
                        setDeviceActionError("");
                    }}
                    onDelete={(sessionId) => {
                        setDeletingSessionId(sessionId);
                        setDeviceActionError("");

                        deleteMyDevice(sessionId)
                            .then(async () => {
                                const remainingDevices = deviceLimitDetails.activeDevices.filter(
                                    (device) => device.sessionId !== sessionId,
                                );
                                const nextDetails = {
                                    ...deviceLimitDetails,
                                    activeDevices: remainingDevices,
                                };
                                setDeviceLimitDetails(nextDetails);

                                if (remainingDevices.length < deviceLimitDetails.maxDevices) {
                                    await submitLogin(formik.values.password);
                                }
                            })
                            .catch((error: Error) => {
                                setDeviceActionError(error.message);
                            })
                            .finally(() => {
                                setDeletingSessionId(null);
                            });
                    }}
                    onReplace={(sessionId) => {
                        setReplacingSessionId(sessionId);
                        setDeviceActionError("");

                        submitLogin(formik.values.password, sessionId)
                            .catch((error: Error) => {
                                setDeviceActionError(error.message);
                            })
                            .finally(() => {
                                setReplacingSessionId(null);
                            });
                    }}
                />
            ) : null}
        </>
    );
}
