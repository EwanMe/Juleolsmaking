import os.path
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.linear_model import Ridge

import joblib

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"]


def google():
    """Shows basic usage of the Drive v3 API.
    Prints the names and ids of the first 10 files the user has access to.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        service = build("drive", "v3", credentials=creds)

        # Call the Drive v3 API
        results = (
            service.files()
            .list(pageSize=10, fields="nextPageToken, files(id, name)")
            .execute()
        )
        items = results.get("files", [])

        if not items:
            print("No files found.")
            return
        print("Files:")
        for item in items:
            print(f"{item['name']} ({item['id']})")
    except HttpError as error:
        # TODO(developer) - Handle errors from drive API.
        print(f"An error occurred: {error}")


def get_data(file: Path) -> pd.DataFrame:
    sheets = pd.read_excel(file, sheet_name=None, index_col=None)
    for name, sheet in sheets.items():
        sheet["year"] = int(name)

    return pd.concat(sheets.values(), ignore_index=True)


def trend():
    df = get_data("Statistikk Juleøl.xlsx")

    ax = plt.subplot()
    value_counts = df["Navn"].value_counts()
    names = value_counts[value_counts > 1].index.tolist()
    years = df["year"]
    all_years = np.arange(int(years.min()), int(years.max()) + 1, 1)

    for name in names:
        by_name = df.loc[df["Navn"] == name].sort_values("year")
        actual_years = by_name["year"].values
        actual_scores = by_name["Score Total"].values

        # Plot line (interpolated)
        ax.plot(actual_years, actual_scores, label=name, alpha=0.6, linewidth=2)

        # Plot actual data points as markers
        ax.scatter(actual_years, actual_scores, s=50, zorder=5)

    ax.set_xticks(all_years)
    ax.set_xlabel("År")
    ax.set_ylabel("Score")
    ax.set_title("Juleøl")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.show()


def top():
    df = get_data("Statistikk Juleøl.xlsx")

    df = df.sort_values("Score Total", ascending=False)
    df = df[["Navn", "Type", "ABV", "year", "Score Total"]].head(10)
    df.to_csv("out.csv")


def data_cleaning():
    df = get_data("Statistikk Juleøl.xlsx")

    required_columns = [
        "Navn",
        "Bryggeri",
        "Type",
        "ABV",
        "Volum (L)",
        "Pris (kr)",
        "Score Total",
    ]

    df = df.dropna(subset=required_columns)

    df["Pris/L"] = df["Pris (kr)"] / df["Volum (L)"]

    return df


def feature_engineering(df: pd.DataFrame, *, split: bool = True):
    # Prepare features
    X = df[["Navn", "Bryggeri", "Type", "ABV", "Pris/L"]]
    y = df["Score Total"]

    # One-hot encode beer type
    encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    type_encoded = encoder.fit_transform(X[["Bryggeri", "Type"]])
    type_df = pd.DataFrame(
        type_encoded,
        columns=encoder.get_feature_names_out(["Bryggeri", "Type"]),
    )
    joblib.dump(encoder, "encoder.pkl")

    # Combine numeric features with encoded types
    X_numeric = X[["ABV", "Pris/L"]].reset_index(drop=True)
    X_final = pd.concat([X_numeric, type_df], axis=1)

    if not split:
        print("No training split")
        return X_final, y

    # Split data (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X_final, y, test_size=0.2, random_state=42
    )
    return X_train, X_test, y_train, y_test, X_final


def train_random_forest(X_train, X_test, y_train, y_test, X_final):
    model = RandomForestRegressor(
        n_estimators=50, max_depth=5, min_samples_split=5, random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("Random Forest")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    feature_importance = pd.DataFrame(
        {"feature": X_final.columns, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)
    print("\nTop features:")
    print(feature_importance)

    joblib.dump(model, "beer_model_random_forest.pkl")


def train_and_test_linear_regressor(X_train, X_test, y_train, y_test, X_final):
    model = Ridge(alpha=10.0)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("Linear regressor")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    feature_importance = pd.DataFrame(
        {
            "feature": X_final.columns,
            "coefficient": model.coef_,
            "abs_coefficient": abs(model.coef_),
        }
    ).sort_values("abs_coefficient", ascending=False)

    print("\nTop features:")
    print(feature_importance)

    joblib.dump(model, "beer_linear_regressor.pkl")


def train_final_ridge_model(X_final, y):
    model = Ridge(alpha=10.0)
    model.fit(X_final, y)
    joblib.dump(model, "beer_linear_regressor.pkl")

    feature_importance = pd.DataFrame(
        {
            "feature": X_final.columns,
            "coefficient": model.coef_,
            "abs_coefficient": abs(model.coef_),
        }
    ).sort_values("abs_coefficient", ascending=False)
    print("\Coefficients for Final Model:")
    print(feature_importance.head(10))


def main():
    # trend()
    # top()
    df = data_cleaning()
    # X_train, X_test, y_train, y_test, X_final = feature_engineering(df)

    # train_random_forest(X_train, X_test, y_train, y_test, X_final)
    # train_and_test_linear_regressor(X_train, X_test, y_train, y_test, X_final)

    X_final, y = feature_engineering(df, split=False)
    train_final_ridge_model(X_final, y)


if __name__ == "__main__":
    main()
