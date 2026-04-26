const MENU_KEY = "menu";

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: string;
}

export function initMockMenu(): void {
  if (!localStorage.getItem(MENU_KEY)) {
    localStorage.setItem(
      MENU_KEY,
      JSON.stringify([
        {
          id: 1,
          name: "Hambúrguer",
          price: "25.00",
          category: "Lanches"
        },
        {
          id: 2,
          name: "Refrigerante",
          price: "7.00",
          category: "Bebidas"
        }
      ] satisfies MenuItem[])
    );
  }
}

export function getMenuMock(): MenuItem[] {
  return JSON.parse(localStorage.getItem(MENU_KEY) ?? '[]') || [];
}

export function saveMenuMock(menu: MenuItem[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}
