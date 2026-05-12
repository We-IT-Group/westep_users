import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMyDevice, getMyDevices } from "./deviceApi.ts";

export function useMyDevices() {
    return useQuery({
        queryKey: ["my-devices"],
        queryFn: getMyDevices,
    });
}

export function useDeleteMyDevice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMyDevice,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-devices"] });
        },
    });
}
