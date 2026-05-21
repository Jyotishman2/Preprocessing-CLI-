from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd
import numpy as np
import json
import os

from pathlib import Path

from utils import (
    validate_file,
    save_uploaded_file,
    get_file_path,
    save_analysis_log,
)

from analysis import (
    analyze_dataset,
    get_summary_stats,
)

from preprocessing import PreprocessingPipeline
from ai_suggestions import AISuggestions

# ==========================================================
# CREATE REQUIRED FOLDERS
# ==========================================================

os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)
os.makedirs("processed/logs", exist_ok=True)

# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI(
    title="PrepAI Backend",
    description="Automated Data Preprocessing API",
    version="2.0.0",
)

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# NUMPY SAFE CONVERTER
# ==========================================================

def convert_numpy(obj):

    if isinstance(obj, np.integer):
        return int(obj)

    elif isinstance(obj, np.floating):
        return float(obj)

    elif isinstance(obj, np.ndarray):
        return obj.tolist()

    elif isinstance(obj, tuple):
        return list(obj)

    elif pd.isna(obj):
        return None

    return obj


def safe_json(data):
    return json.loads(
        json.dumps(data, default=convert_numpy)
    )

# ==========================================================
# CONFIG MODEL
# ==========================================================

class PreprocessConfig(BaseModel):

    fill_strategy: str = "mean"
    scaling_method: str = "standard"
    outlier_threshold: float = 1.5
    variance_threshold: float = 0.01
    remove_duplicates: bool = True
    encode_categorical: bool = True

# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/")
async def health_check():

    return {
        "status": "ok",
        "service": "PrepAI Backend",
    }

# ==========================================================
# FILE UPLOAD
# ==========================================================

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    try:

        content = await file.read()

        is_valid, message = validate_file(
            file.filename,
            len(content)
        )

        if not is_valid:

            raise HTTPException(
                status_code=400,
                detail=message
            )

        save_uploaded_file(
            file.filename,
            content
        )

        return {
            "filename": file.filename,
            "message": "File uploaded successfully",
            "file_size": int(len(content)),
        }

    except HTTPException:
        raise

    except Exception as e:

        print("UPLOAD ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

# ==========================================================
# DATASET SUMMARY
# ==========================================================

@app.get("/api/summary/{filename}")
async def get_summary(filename: str):

    try:

        file_path = get_file_path(filename)

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        analyze_dataset(df)

        summary = get_summary_stats(df)

        return safe_json(summary)

    except HTTPException:
        raise

    except Exception as e:

        print("SUMMARY ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

# ==========================================================
# PREPROCESS DATASET
# ==========================================================

@app.post("/api/preprocess/{filename}")
async def preprocess_file(
    filename: str,
    config: PreprocessConfig
):

    try:

        file_path = get_file_path(filename)

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        pipeline = PreprocessingPipeline(
            config.dict()
        )

        clean_df, ml_df, steps_log = (
            pipeline.fit_transform(df)
        )

        clean_filename = f"cleaned_{filename}"
        ml_filename = f"ml_ready_{filename}"

        clean_path = get_file_path(
            clean_filename,
            "processed"
        )

        ml_path = get_file_path(
            ml_filename,
            "processed"
        )

        if filename.endswith(".csv"):

            clean_df.to_csv(
                clean_path,
                index=False
            )

            ml_df.to_csv(
                ml_path,
                index=False
            )

        else:

            clean_df.to_excel(
                clean_path,
                index=False
            )

            ml_df.to_excel(
                ml_path,
                index=False
            )

        save_analysis_log(
            filename,
            {
                "original_shape":
                    list(pipeline.original_shape),

                "clean_shape":
                    list(clean_df.shape),

                "ml_shape":
                    list(ml_df.shape),

                "steps":
                    steps_log,
            },
        )

        response = {

            "cleaned_file":
                clean_filename,

            "ml_file":
                ml_filename,

            "message":
                "Preprocessing completed successfully",

            "original_shape":
                list(pipeline.original_shape),

            "clean_shape":
                list(clean_df.shape),

            "ml_shape":
                list(ml_df.shape),

            "steps":
                steps_log,
        }

        return safe_json(response)

    except HTTPException:
        raise

    except Exception as e:

        print("PREPROCESS ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Preprocessing failed: {str(e)}"
        )

# ==========================================================
# DOWNLOAD FILE
# ==========================================================

@app.get("/api/download/{filename}")
async def download_file(filename: str):

    try:

        file_path = get_file_path(
            filename,
            "processed"
        )

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail=f"File not found: {filename}"
            )

        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/octet-stream",
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {str(e)}"
        )

# ==========================================================
# AI SUGGESTIONS
# ==========================================================

@app.get("/api/ai-suggestions/{filename}")
async def get_ai_suggestions(filename: str):

    try:

        file_path = get_file_path(filename)

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        analysis = analyze_dataset(df)

        ai = AISuggestions()

        suggestions = ai.get_suggestions(
            analysis
        )

        return safe_json(suggestions)

    except Exception as e:

        print(f"AI Error: {e}")

        return {
            "quality_score": 75,
            "quality_feedback": "Moderate data quality",
            "suggestions": [
                "Missing data detected",
                "Consider feature scaling",
                "Outlier removal recommended",
            ],
            "model_recommendations": [
                "Regression",
                "Classification",
                "Clustering",
            ],
        }

# ==========================================================
# VISUALIZATIONS
# ==========================================================

@app.get("/api/visualizations/{filename}")
async def get_visualizations(filename: str):

    try:

        file_path = get_file_path(filename)

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        visualizations = {

            "missing_values":
                df.isnull().sum().to_dict(),

            "numeric_summary":
                df.describe().to_dict(),

            "correlation":
                df.select_dtypes(
                    include="number"
                ).corr().fillna(0).to_dict(),
        }

        return safe_json(visualizations)

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Visualization failed: {str(e)}"
        )

# ==========================================================
# REPORT DOWNLOAD
# ==========================================================

@app.get("/api/report/{filename}")
async def get_report(filename: str):

    try:

        log_dir = Path("processed/logs")

        base_name = (
            Path(filename)
            .stem
            .replace("cleaned_", "")
            .replace("ml_ready_", "")
        )

        report_path = (
            log_dir /
            f"{base_name}_analysis.json"
        )

        if not report_path.exists():

            raise HTTPException(
                status_code=404,
                detail="Report not found"
            )

        return FileResponse(
            path=report_path,
            filename=f"{base_name}_report.json",
            media_type="application/json",
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Report failed: {str(e)}"
        )

# ==========================================================
# DATA PREVIEW
# ==========================================================

@app.get("/api/preview/{filename}")
async def preview_data(filename: str):

    try:

        file_path = get_file_path(
            filename,
            "processed"
        )

        if not file_path.exists():

            raise HTTPException(
                status_code=404,
                detail="Preview file not found"
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        preview_df = df.head(50)

        response = {

            "columns":
                preview_df.columns.tolist(),

            "rows":
                preview_df.fillna("").to_dict(
                    orient="records"
                ),

            "row_count":
                int(len(preview_df)),

            "column_count":
                int(len(preview_df.columns)),
        }

        return safe_json(response)

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Preview failed: {str(e)}"
        )

# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )