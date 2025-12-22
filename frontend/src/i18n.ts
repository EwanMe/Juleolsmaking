import { BeerType } from './beerTypes';

type BeerTypeTranslations = Record<BeerType, string>;

export type Translations = {
  title: string;
  description: string;
  brewery: string;
  type: string;
  abv: string;
  volume: string;
  price: string;
  calculate: string;
  predictedScore: string;
  loading: string;
  networkError: string;
  invalidNumber: string;
  apiError: string;
  unknownError: string;

  beerTypes: BeerTypeTranslations;
};

export type Language = 'en' | 'no' | 'nn';

export const translations: Record<Language, Translations> = {
  en: {
    title: 'Xmas Beer Score Predictor 🍺',
    description: 'Estimate the score based on key factors.',
    brewery: 'Brewery',
    type: 'Type',
    abv: 'ABV (%)',
    volume: 'Volume (L)',
    price: 'Price (kr)',
    calculate: 'Calculate Prediction',
    predictedScore: 'Predicted Total Score:',
    loading: 'Loading...',
    networkError: "Couldn't reach API",
    invalidNumber: 'Must be a valid number',
    apiError: 'API error',
    unknownError: 'Unknown error',
    beerTypes: {
      Bokkøl: 'Bock',
      Juleøl: 'Christmas beer',
      Porter: 'Porter',
      Stout: 'Stout',
      IPA: 'IPA',
      'Pale Ale': 'Pale Ale',
      Lager: 'Lager',
      Pilsner: 'Pilsner',
    },
  },
  no: {
    title: 'Juleøl Poeng-Prediktor 🍺',
    description: 'Estimer poengsum basert på nøkkelfaktorer.',
    brewery: 'Bryggeri',
    type: 'Type',
    abv: 'ABV (%)',
    volume: 'Volum (L)',
    price: 'Pris (kr)',
    calculate: 'Beregn Prediksjon',
    predictedScore: 'Predikert Total Score:',
    loading: 'Laster...',
    networkError: 'Kunne ikke nå API',
    invalidNumber: 'Må være et gyldig tall',
    apiError: 'API-feil',
    unknownError: 'Ukjent feil',
    beerTypes: {
      Bokkøl: 'Bokkøl',
      Juleøl: 'Juleøl',
      Porter: 'Porter',
      Stout: 'Stout',
      IPA: 'IPA',
      'Pale Ale': 'Pale Ale',
      Lager: 'Lager',
      Pilsner: 'Pilsner',
    },
  },
  nn: {
    title: 'Juleøl Poeng-Forutsjåar 🍺',
    description: 'Berekn poeng basert på nøkkelfaktorar.',
    brewery: 'Bryggeri',
    type: 'Type',
    abv: 'Volumprosent (%)',
    volume: 'Volum (L)',
    price: 'Pris (kr)',
    calculate: 'Rekn ut føreseielse',
    predictedScore: 'Føresett totalskår:',
    loading: 'Lastar...',
    networkError: 'Kunne ikkje nå programmeringsgrensesnitt',
    invalidNumber: 'Må vere eit gyldig tal',
    apiError: 'Programmeringsgrensesnittfeil',
    unknownError: 'Ukjend feil',
    beerTypes: {
      Bokkøl: 'Bokkøl',
      Juleøl: 'Juleøl',
      Porter: 'Porter',
      Stout: 'Stout',
      IPA: 'IPA',
      'Pale Ale': 'Pale Ale',
      Lager: 'Lager',
      Pilsner: 'Pilsner',
    },
  },
};
