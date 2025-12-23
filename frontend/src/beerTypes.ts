export const BEER_TYPES = [
  'Amber Ale',
  'Barley Wine',
  'Blonde Ale',
  'Bokkøl',
  'Hveteøl',
  'IPA',
  'Klosterstil',
  'Lys Ale',
  'Lys Lager',
  'Mørk Lager',
  'Pilsner',
  'Saison',
  'Scotch Ale',
  'Stout',
  'Surøl',
  'Annen',
] as const;

export type BeerType = (typeof BEER_TYPES)[number];
