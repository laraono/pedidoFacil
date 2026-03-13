import icon from '../../assets/food.jpg';
import food from '../../assets/hamburguer.png'

const categories = [
  {
    id: 1,
    name: 'Lanches',
    image: icon
  },
  {
    id: 2,
    name: 'Bebidas',
    image: icon
  },
  {
    id: 3,
    name: 'Sobremesas',
    image: icon
  }
];

const products = [
  {
    id: 1,
    name: 'X-Bacon',
    description: 'Hambúrguer com muito bacon crocante.',
    image: food,
    categoryId: 1,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
  {
    id: 2,
    name: 'X-Salada',
    description: 'Hambúrguer com muita salada crocante.',
    image: food,
    categoryId: 1,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
  {
    id: 3,
    name: 'X-Salada',
    description: 'Hambúrguer com muita salada crocante.',
    image: food,
    categoryId: 2,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
];