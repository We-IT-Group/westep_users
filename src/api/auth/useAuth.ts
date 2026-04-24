import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    checkPhoneNumber,
    resetPassword,
    getCurrentUser,
    login,
    logout,
    register,
    sendOtpCode,
    uploadAvatar,
    updateProfile,
    UpdateProfileBody,
    verifyCode
} from "./authApi.ts";
import {useNavigate} from "react-router-dom";
import {getItem} from "../../utils/utils.ts";
import {useToast} from "../../hooks/useToast.tsx";
import type { User } from "../../types/types.ts";

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
            console.log(error);
            toast.error(error.message);
        },
    });
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
