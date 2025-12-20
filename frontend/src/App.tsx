import React, { useState, ChangeEvent } from 'react';
import { useTranslations } from './useTranslations';
import { BEER_TYPES, BeerType } from './beerTypes';

interface FormInputProps {
  label: string;
  id: string;
  type?: 'text' | 'number';
  step?: string | number;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

function FormInput({
  label,
  id,
  type = 'text',
  step,
  value,
  onChange,
  error,
}: FormInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        id={id}
        step={step}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border
                    focus:border-yellow-400 focus:ring focus:ring-yellow-400
                    focus:ring-opacity-50 ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </label>
  );
}

type FormData = {
  bryggeri: string;
  type: BeerType;
  abv: string;
  volum_l: string;
  pris_kr: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function BeerScorePredictor() {
  const { t, lang, setLang } = useTranslations('no'); // default to Norwegian
  const [formData, setFormData] = useState<FormData>({
    bryggeri: 'Macks Ølbryggeri',
    type: 'Bokkøl',
    abv: '9',
    volum_l: '0.33',
    pris_kr: '47.8',
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    const numericFields: (keyof FormData)[] = ['abv', 'volum_l', 'pris_kr'];
    numericFields.forEach((field) => {
      if (isNaN(parseFloat(formData[field]))) {
        newErrors[field] = t.invalidNumber;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setPrediction(null);
    setApiError(null);
    setLoading(true);

    const payload = {
      ...formData,
      abv: parseFloat(formData.abv) / 100,
      volum_l: parseFloat(formData.volum_l),
      pris_kr: parseFloat(formData.pris_kr),
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setPrediction(result.predicted_score_total);
      } else {
        setApiError(`${t.apiError}: ${result.error || t.unknownError}`);
      }
    } catch (e) {
      setApiError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        {/* Language switch */}
        <div className="flex justify-end mb-4 space-x-2">
          <button
            className={`px-3 py-1 rounded ${
              lang === 'no' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200'
            }`}
            onClick={() => setLang('no')}
          >
            NO
          </button>
          <button
            className={`px-3 py-1 rounded ${
              lang === 'nn' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200'
            }`}
            onClick={() => setLang('nn')}
          >
            NN
          </button>
          <button
            className={`px-3 py-1 rounded ${
              lang === 'en' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200'
            }`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {t.title}
        </h1>
        <p className="text-center text-gray-600 mb-8">{t.description}</p>

        <div className="space-y-4">
          <FormInput
            label={t.brewery}
            id="bryggeri"
            value={formData.bryggeri}
            onChange={handleChange}
          />

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.type}</span>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as BeerType,
                }))
              }
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border
              bg-white appearance-none
              focus:border-yellow-400 focus:ring focus:ring-yellow-400
              focus:ring-opacity-50"
            >
              {BEER_TYPES.map((beerType) => (
                <option key={beerType} value={beerType}>
                  {t.beerTypes[beerType]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label={t.abv}
              id="abv"
              type="text"
              value={formData.abv}
              onChange={handleChange}
              error={errors.abv}
            />
            <FormInput
              label={t.volume}
              id="volum_l"
              type="text"
              value={formData.volum_l}
              onChange={handleChange}
              error={errors.volum_l}
            />
            <FormInput
              label={t.price}
              id="pris_kr"
              type="text"
              value={formData.pris_kr}
              onChange={handleChange}
              error={errors.pris_kr}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 mt-6 bg-yellow-400 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition duration-150 ease-in-out disabled:opacity-50"
          >
            {t.calculate}
          </button>
        </div>

        {prediction !== null && (
          <div className="mt-8 p-6 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg shadow-inner">
            <p className="text-lg font-semibold text-gray-800">
              {t.predictedScore}
            </p>
            <p className="text-4xl font-extrabold text-yellow-500 mt-1">
              {prediction}
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center text-gray-500">{t.loading}</div>
        )}
        {apiError && (
          <div className="mt-4 text-center text-red-600">{apiError}</div>
        )}
      </div>
    </div>
  );
}
