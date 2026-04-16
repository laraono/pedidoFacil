import { createSoftDeleteStore } from './baseSoftDelete';

export interface Category {
  id: number;
  name: string;
  image: string;
  deletedAt: string | null;
}

const initialCategories: Category[] = [
  { id: 1, name: 'Lanches', image: '@/assets/food.jpg', deletedAt: null },
  { id: 2, name: 'Bebidas', image: '@/assets/food.jpg', deletedAt: null },
  { id: 3, name: 'Sobremesas', image: '@/assets/food.jpg', deletedAt: null }
];

export const useCategoryStore = createSoftDeleteStore<Category>('categories', initialCategories);
