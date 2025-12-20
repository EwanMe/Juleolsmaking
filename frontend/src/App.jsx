import { useState } from 'react';

export default function BeerScorePredictor() {
  const [formData, setFormData] = useState({
    bryggeri: 'Macks Ølbryggeri',
    type: 'Bokkøl',
    abv: 0.09,
    volum_l: 0.33,
    pris_kr: 47.8,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: ['abv', 'volum_l', 'pris_kr'].includes(id)
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    setPrediction(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setPrediction(result.predicted_score_total);
      } else {
        setError(`API-feil: ${result.error || 'Ukjent feil'}`);
        console.error('API Error Response:', result);
      }
    } catch (e) {
      setError('Nettverksfeil. Sjekk at Flask-API er operativt.');
      console.error('Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Juleøl Score Prediktor 🍺
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Estimer score basert på nøkkelfaktorer.
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Bryggeri</span>
            <input
              type="text"
              id="bryggeri"
              value={formData.bryggeri}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 p-3 border"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Type</span>
            <input
              type="text"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 p-3 border"
            />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">ABV (%)</span>
              <input
                type="number"
                id="abv"
                step="0.001"
                value={formData.abv}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 p-3 border"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Volum (L)
              </span>
              <input
                type="number"
                id="volum_l"
                step="0.01"
                value={formData.volum_l}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 p-3 border"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Pris (kr)
              </span>
              <input
                type="number"
                id="pris_kr"
                step="0.01"
                value={formData.pris_kr}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 p-3 border"
              />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 mt-6 bg-yellow-400 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition duration-150 ease-in-out disabled:opacity-50"
          >
            Beregn Prediksjon
          </button>
        </div>

        {prediction !== null && (
          <div className="mt-8 p-6 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg shadow-inner">
            <p className="text-lg font-semibold text-gray-800">
              Predikert Total Score:
            </p>
            <p className="text-4xl font-extrabold text-yellow-500 mt-1">
              {prediction}
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center text-gray-500">Laster...</div>
        )}

        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      </div>
    </div>
  );
}
