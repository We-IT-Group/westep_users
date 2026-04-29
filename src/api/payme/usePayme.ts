import {useMutation} from "@tanstack/react-query";
import {createPaymentCheckout} from "./paymeApi.ts";


export const useCreatePaymentCheckout = () => {
    return useMutation({
        mutationFn: createPaymentCheckout,
        onSuccess: async (data) => {
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
            }

            alert("To'lov havolasi topilmadi");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const usePaymeCreate = useCreatePaymentCheckout;
