import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    type DeviceLimitExceededDetails,
    checkPhoneNumber,
    isDeviceLimitExceededError,
    resetPassword,
    getCurrentUser,
    login,
    logout,
    register,
    revokeDeviceForLogin,
    sendOtpCode,
    uploadAvatar,
    updateProfile,
    UpdateProfileBody,
    verifyCode
} from "./authApi.ts";
import {useNavigate} from "react-router-dom";
import {useCallback, useState} from "react";
import {getItem} from "../../utils/utils.ts";
import {useToast} from "../../hooks/useToast.tsx";
import type { User } from "../../types/types.ts";
import { getCurrentDeviceName, getOrCreateDeviceId } from "../../utils/device.ts";

export const useUser = () =>
    useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getCurrentUser();
        },
        retry: false,
    });

export const useLogin = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: login,
        onSuccess: async () => {
            const user = await getCurrentUser();
            qc.setQueryData(["currentUser"], user);
            navigate("/");
            sessionStorage.removeItem("form");
        },
        onError: (error) => {
            if (isDeviceLimitExceededError(error)) {
                return;
            }
            toast.error(error.message);
        },
    });
};

export const useRevokeDeviceForLogin = () => {
    return useMutation({
        mutationFn: revokeDeviceForLogin,
    });
};

interface PendingLoginState {
    phoneNumber: string;
    password: string;
    deviceId: string;
    deviceName: string;
}

export const useDeviceLimitFlow = () => {
    const { mutateAsync: loginMutateAsync, isPending: isLoginPending } = useLogin();
    const { mutateAsync: revokeMutateAsync, isPending: isRevoking } = useRevokeDeviceForLogin();
    const [deviceLimitDetails, setDeviceLimitDetails] = useState<DeviceLimitExceededDetails | null>(null);
    const [deviceActionError, setDeviceActionError] = useState("");
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
    const [pendingLoginState, setPendingLoginState] = useState<PendingLoginState | null>(null);

    const clearDeviceLimitState = useCallback(() => {
        setDeviceLimitDetails(null);
        setDeviceActionError("");
        setDeletingSessionId(null);
        setPendingLoginState(null);
    }, []);

    const submitLogin = useCallback(
        async (phoneNumber: string, password: string) => {
            const nextPendingLoginState: PendingLoginState = {
                phoneNumber,
                password,
                deviceId: getOrCreateDeviceId(),
                deviceName: getCurrentDeviceName(),
            };

            setPendingLoginState(nextPendingLoginState);
            setDeviceActionError("");

            try {
                await loginMutateAsync(nextPendingLoginState);
                clearDeviceLimitState();
                return true;
            } catch (error) {
                if (isDeviceLimitExceededError(error)) {
                    setDeviceLimitDetails(error.details);
                    return false;
                }

                throw error;
            }
        },
        [clearDeviceLimitState, loginMutateAsync],
    );

    const revokeDeviceAndContinue = useCallback(
        async (sessionId: string) => {
            if (!pendingLoginState) {
                throw new Error("Login ma'lumotlari topilmadi");
            }

            setDeletingSessionId(sessionId);
            setDeviceActionError("");

            try {
                await revokeMutateAsync({
                    sessionId,
                    phoneNumber: pendingLoginState.phoneNumber,
                    password: pendingLoginState.password,
                });

                await loginMutateAsync({
                    ...pendingLoginState,
                });
                clearDeviceLimitState();
            } catch (error) {
                if (isDeviceLimitExceededError(error)) {
                    setDeviceLimitDetails(error.details);
                    setDeviceActionError(error.message);
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Qurilmani almashtirishda xatolik yuz berdi";
                setDeviceActionError(message);
            } finally {
                setDeletingSessionId(null);
            }
        },
        [clearDeviceLimitState, loginMutateAsync, pendingLoginState, revokeMutateAsync],
    );

    return {
        deviceLimitDetails,
        deviceActionError,
        deletingSessionId,
        isLoginPending,
        isRevoking,
        submitLogin,
        revokeDeviceAndContinue,
        closeDeviceLimitModal: clearDeviceLimitState,
    };
};

export const useRegister = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: register,
        onSuccess: async () => {
            navigate("/success");
            sessionStorage.removeItem("form");
        },
        onError: (error) => {
            alert(error.message);
        }
    });
};

export const useLogout = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            qc.removeQueries({queryKey: ["currentUser"]});
        },
    });
};

export const useCheckPhoneNumber = () => {
        const navigate = useNavigate();
        return useMutation({
            mutationFn: checkPhoneNumber,
            onSuccess: (_, body: { phoneNumber: string }) => {
                navigate("/password", {state: {phoneNumber: body.phoneNumber}});
            },
            onError: (error, body: { phoneNumber: string }) => {
                console.log(error);
                navigate("/register", {state: {phoneNumber: body.phoneNumber}}); // success -> password sahifasiga o‘tish
            },
        });
    }
;

export const useOtpPhoneNumber = (type:string) => {
    sessionStorage.setItem("otpType", JSON.stringify(type));
    const navigate = useNavigate();
    return useMutation({
        mutationFn: sendOtpCode,
        onSuccess: () => {
            navigate("/verify-code");
        },
        onError: (error) => {
            return error
        },
    });
};

export const useVerifyCode = () => {
    const {mutate} = useRegister();
    const {mutate:resetPassword} = useResetPassword();
    const otpType = JSON.parse(sessionStorage.getItem('otpType') as string);
    return useMutation({
        mutationFn: verifyCode,
        onSuccess: () => {
            const form = JSON.parse(sessionStorage.getItem("form") as string);
            if (otpType === "REGISTER") {
                mutate({
                    birthDate:form.birthDate,
                    firstname:form.firstName,
                    lastname:form.lastName,
                    password:form.password,
                    gender:form.gender,
                    phone:form.phoneNumber,
                    phoneNumber:form.phoneNumber,
                })
            }
            else{
                resetPassword({
                    password:form.password,
                    phoneNumber:form.phoneNumber,
                });
            }
        },
        onError: (error) => {
            return error
        },
    });
};

export const useResetPassword = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            navigate("/login");
        },
        onError: (error) => {
            return error
        },
    });
};

export const useUpdateProfile = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (body: UpdateProfileBody) => updateProfile(body),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["currentUser"]});
            toast.success("Profil yangilandi");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

export const useUploadAvatar = () => {
    const qc = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (file: File) => uploadAvatar(file),
        onSuccess: async (response) => {
            qc.setQueryData(["currentUser"], (previous: User | undefined) => {
                if (!previous) return previous;

                const avatarPath =
                    typeof response === "string"
                        ? response
                        : response?.avatarUrl ||
                          response?.avatar ||
                          response?.attachmentUrl ||
                          response?.profileImageUrl ||
                          response?.imageUrl ||
                          response?.url ||
                          previous.avatarUrl ||
                          previous.avatar ||
                          previous.attachmentUrl ||
                          previous.profileImageUrl ||
                          previous.imageUrl;

                return {
                    ...previous,
                    avatarUrl: avatarPath,
                    avatar: avatarPath,
                    attachmentUrl: avatarPath,
                    profileImageUrl: avatarPath,
                    imageUrl: avatarPath,
                };
            });
            await qc.invalidateQueries({queryKey: ["currentUser"]});
            toast.success("Profil rasmi yangilandi");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};
