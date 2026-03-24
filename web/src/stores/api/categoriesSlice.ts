import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const categoriesApi = createApi({
    reducerPath: 'categoriesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/v1/categories' }),
    endpoints: (build) => ({
        postCategory: build.mutation({
            query: ({name}) => ({
                url:'',
                method: 'POST',
                body: name
            })
        }),
        getCategories: build.query({
            query: () => ''
        })
    }),
})

export const { usePostCategoryMutation, useLazyGetCategoriesQuery } = categoriesApi