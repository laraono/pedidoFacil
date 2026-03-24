import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const comandaApi = createApi({
    reducerPath: 'comandaApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/v1/commands' }),
    endpoints: (build) => ({
        postComanda: build.mutation({
            query: ({description, status, total, discountValue}) => ({
                url:'',
                method: 'POST',
                body: {description, status, total, discountValue}
            })
        }),
        getComandas: build.query({
            query: () => ''
        }),
        getOpenComandas:  build.query({
            query: () => '/open'
        }),
        getClosedComandas:  build.query({
            query: () => '/closed'
        }),
        cancelComanda: build.mutation({
            query: ({id, ...body}) => ({
                url:`/${id}/cancel`,
                method: 'POST',
                body
            })
        }),
        updateComandaStatus: build.mutation({
            query: ({id, ...status}) => ({
                url:`/${id}`,
                method: 'POST',
                body: status
            })
        }),
    }),
})

export const { 
    useCancelComandaMutation,
    useLazyGetClosedComandasQuery,
    useLazyGetComandasQuery,
    useLazyGetOpenComandasQuery,
    usePostComandaMutation,
    useUpdateComandaStatusMutation
} = comandaApi