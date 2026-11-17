export type SearchPage = {
  id: number;
  title: string;
  url: string;
  content: string;
  linksTo: number[];
};

// The page text and directed links match the classroom dataset exactly.
export const ORIGINAL_PAGES: SearchPage[] = [
  {
    id: 1,
    title: 'Pune Food Guide',
    url: 'pune-food-guide.com',
    content: 'Where to eat in Pune - vada pav and biryani and pizza',
    linksTo: [2],
  },
  {
    id: 2,
    title: 'Best Pizza Pune',
    url: 'best-pizza-pune.com',
    content: 'Fresh wood-fired pizza made daily - try our cheese pizza',
    linksTo: [1, 3],
  },
  {
    id: 3,
    title: 'College Canteen Blog',
    url: 'college-canteen-blog.com',
    content: 'Student reviews of canteen food and chai and Friday pizza',
    linksTo: [2, 4],
  },
  {
    id: 4,
    title: 'Pizza Recipes Home',
    url: 'pizza-recipes-home.com',
    content: 'Make pizza at home - pizza dough and pizza sauce',
    linksTo: [2, 5],
  },
  {
    id: 5,
    title: 'Cheap Eats Pune',
    url: 'cheap-eats-pune.com',
    content: 'Good food under 100 rupees - misal and dosa and pizza slices',
    linksTo: [2],
  },
  {
    id: 6,
    title: 'Pizza Pizza Pizza',
    url: 'pizza-pizza-pizza.com',
    content: 'pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza',
    linksTo: [1],
  },
];
