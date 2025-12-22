FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

COPY backend/server-requirements.txt .
RUN pip install --no-cache-dir -r server-requirements.txt

COPY backend/ .

COPY --from=frontend-build /frontend/build ./build

COPY backend/beer_linear_regressor.pkl .
COPY backend/encoder.pkl .

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--threads", "4", "--timeout", "120", "app:app"]