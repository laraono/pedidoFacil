import { request } from "./api";

export const registerApi = {
    post: async (name) =>
        await request("/estabelecimento/registers", {
            method: "POST",
            body: JSON.stringify(name),
        }),

    list: async () =>
        await request("/estabelecimento/registers", {
        method: "GET"
        }),

    associate: async (registerId) =>
        await request("/estabelecimento/registers/associate", {
            method: "POST",
            body: JSON.stringify(registerId),
        }),
};
