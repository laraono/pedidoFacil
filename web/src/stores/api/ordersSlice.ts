import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/v1/' }),
    endpoints: (build) => ({
        postOrder: build.mutation({
            query: ({id, ...body}) => ({
                url:`commands/${id}/orders`,
                method: 'POST',
                body
            })
        }),
        getComandaOrders: build.query({
            query: (id) => `commands/${id}/orders`
        }),
        getOrders:  build.query({
            query: () => '/orders'
        }),
        updateOrderStatus: build.mutation({
            query: ({comandaId, orderId, ...status}) => ({
                url:`commands/${comandaId}/orders/${orderId}`,
                method: 'POST',
                body: status
            })
        }),
    }),
})

export const { 
    useLazyGetComandaOrdersQuery,
    useLazyGetOrdersQuery,
    useUpdateOrderStatusMutation,
    usePostOrderMutation
} = orderApi