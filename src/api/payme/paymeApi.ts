import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";

export type PaymentCheckoutResponse = {
    provider?: string;
    checkoutUrl?: string;
    displayName?: string;
    sourceType?: string;
};

export const createPaymentCheckout = async (orderId: string | undefined) => {
    try {
        const {data} = await apiClient.get<PaymentCheckoutResponse>("/payments/checkout/" + orderId);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
