import pandas as pd
import joblib
from flask import Flask, request, jsonify

# --- 1. Last inn modellen og encoderen ---
try:
    # OBS! Sørg for at disse filene ligger i samme katalog som denne koden
    MODEL = joblib.load("/app/beer_linear_regressor.pkl")
    ENCODER = joblib.load("/app/encoder.pkl")
except FileNotFoundError:
    print(
        "FEIL: Kunne ikke finne 'beer_linear_regressor.pkl' eller 'encoder.pkl'."
    )
    print(
        "Vennligst tren den endelige modellen på hele datasettet og lagre filene."
    )
    # Setter til None for å tillate at appen starter, men vil feile ved prediksjon
    MODEL = None
    ENCODER = None


# --- 2. Hjelpefunksjon for Feature Engineering ---
def prepare_features(input_data: dict) -> pd.DataFrame:
    """
    Prosesserer rå inputdata til det formatet modellen forventer.
    """
    if MODEL is None or ENCODER is None:
        raise RuntimeError("Modell eller Encoder er ikke lastet inn.")

    # 1. Beregn Pris/L og lag en DataFrame
    df_raw = pd.DataFrame(
        [
            {
                "Bryggeri": input_data["bryggeri"],
                "Type": input_data["type"],
                "ABV": input_data["abv"],
                "Pris/L": input_data["pris_kr"] / input_data["volum_l"],
            }
        ]
    )

    # 2. Skill numeriske og kategoriske features
    X_numeric = df_raw[["ABV", "Pris/L"]]
    X_categorical = df_raw[["Bryggeri", "Type"]]

    # 3. Anvend den trente OneHotEncoderen
    # Merk: transform, IKKE fit_transform
    encoded_features = ENCODER.transform(X_categorical)

    # Hent kolonnenavn fra encoderen
    feature_names = ENCODER.get_feature_names_out(["Bryggeri", "Type"])
    encoded_df = pd.DataFrame(encoded_features, columns=feature_names)

    # 4. Kombiner alle features
    X_final = pd.concat([X_numeric.reset_index(drop=True), encoded_df], axis=1)

    return X_final


# --- 3. Flask API oppsett ---
app = Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():
    if not MODEL:
        return (
            jsonify(
                {"error": "Modell er ikke lastet inn. Se logg for feilmelding."}
            ),
            500,
        )

    # Forventer JSON-data med disse nøklene
    required_keys = ["bryggeri", "type", "abv", "volum_l", "pris_kr"]

    try:
        data = request.get_json()

        # Sjekk om alle nødvendige nøkler er til stede
        if not all(k in data for k in required_keys):
            return (
                jsonify(
                    {
                        "error": "Mangler en eller flere nøkler i input. Kreves: "
                        + str(required_keys)
                    }
                ),
                400,
            )

        # 1. Klargjør features
        X_predict = prepare_features(data)

        # 2. Gjør prediksjonen
        prediction = MODEL.predict(X_predict)[0]

        # 3. Returner resultatet
        return jsonify(
            {
                "status": "ok",
                "predicted_score_total": round(float(prediction), 2),
            }
        )

    except Exception as e:
        return (
            jsonify({"error": f"En feil oppstod under prediksjon: {str(e)}"}),
            500,
        )


# --- 4. Kjøring av appen ---
if __name__ == "__main__":
    # app.run(debug=True) # Kjør med debug for utvikling
    print("\n--- Start API ---")
    print("For å kjøre, bruk 'flask run' i terminalen.")
    print("Modellen forventer POST request til /predict med JSON body.")
    print("Eksempel på JSON body:")
    print(
        '{ "bryggeri": "Macks Ølbryggeri", "type": "Bokkøl", "abv": 0.09, "volum_l": 0.33, "pris_kr": 47.8 }'
    )
    print("------------------\n")
