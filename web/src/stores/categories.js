import { createSoftDeleteStore } from './baseSoftDelete';

const initialCategories = [
  { id: 1, name: 'Lanches', image: '@/assets/food.jpg', deletedAt: null },
  { id: 2, name: 'Bebidas', image: '@/assets/food.jpg', deletedAt: null },
  { id: 3, name: 'Sobremesas', image: '@/assets/food.jpg', deletedAt: null }
];

export const useCategoryStore = createSoftDeleteStore('categories', initialCategories);