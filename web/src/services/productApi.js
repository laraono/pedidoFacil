import { request } from "./api";

export const productApi = {
    post: async (product, productVariations, image) =>{
        const formData = new FormData()

        formData.append('product', JSON.stringify(JSON.stringify(product)));
        formData.append('productVariations', JSON.stringify(JSON.stringify(productVariations)));
        
        if (image) {
            if (image) formData.append('image', image);
        }
        await request('/products', { method: 'POST', body: formData })
    },
    listByCategory: async (categoryId) =>
        await request(`/categories/${categoryId}/products`, { method: 'GET'}),

    listActiveByCategory: async (categoryId) =>
        await request(`/categories/${categoryId}/products/active`, { method: 'GET'}),

    list: async () => 
        await request('/products', {method: 'GET'}),

    deleteProduct: async (categoryId, productId) => 
        await request(`/categories/${categoryId}/products/${productId}`, { method: 'DELETE'}),

    putProduct: async (categoryId, productId, product, productVariations, image) =>{
        const formData = new FormData()
        formData.append('product', JSON.stringify(product))
        formData.append('productVariations', JSON.stringify(productVariations))
        if (image) formData.append('image', image)

        await request(`/categories/${categoryId}/products/${productId}`, { method: 'PUT', body: formData})
    },
    putStatus: async (categoryId, productId, status) =>
        await request(`/categories/${categoryId}/products/${productId}/status`, { method: 'PUT', body: JSON.stringify({ status })}),


};