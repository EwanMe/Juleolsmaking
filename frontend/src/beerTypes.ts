export const BEER_TYPES = [
  'Bokkøl',
  'Juleøl',
  'Porter',
  'Stout',
  'IPA',
  'Pale Ale',
  'Lager',
  'Pilsner',
] as const;

export type BeerType = (typeof BEER_TYPES)[number];
