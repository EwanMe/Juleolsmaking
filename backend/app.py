import os
from flask import Flask, send_from_directory, request, jsonify
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "beer_linear_regressor.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "encoder.pkl")

MODEL = joblib.load(MODEL_PATH)
ENCODER = joblib.load(ENCODER_PATH)

app = Flask(__name__, static_folder="build/static", template_folder="build")


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.template_folder, path)):
        return send_from_directory(app.template_folder, path)
    return send_from_directory(app.template_folder, "index.html")


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        required_keys = ["bryggeri", "type", "abv", "volum_l", "pris_kr"]

        if not all(k in data for k in required_keys):
            return (
                jsonify({"error": f"Missing keys, required: {required_keys}"}),
                400,
            )

        df_raw = pd.DataFrame(
            [
                {
                    "Bryggeri": data["bryggeri"].strip().lower(),
                    "Type": data["type"].strip().lower(),
                    "ABV": data["abv"],
                    "Pris/L": data["pris_kr"] / data["volum_l"],
                }
            ]
        )

        X_numeric = df_raw[["ABV", "Pris/L"]]
        X_categorical = df_raw[["Bryggeri", "Type"]]
        encoded_features = ENCODER.transform(X_categorical)
        feature_names = ENCODER.get_feature_names_out(["Bryggeri", "Type"])

        X_final = pd.concat(
            [
                X_numeric.reset_index(drop=True),
                pd.DataFrame(encoded_features, columns=feature_names),
            ],
            axis=1,
        )

        prediction = MODEL.predict(X_final)[0]
        return jsonify({"predicted_score_total": round(float(prediction), 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
