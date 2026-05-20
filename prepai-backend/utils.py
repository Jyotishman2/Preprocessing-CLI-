import os
import json
from datetime import datetime
from pathlib import Path


UPLOADS_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")

# Create directories if they don't exist
UPLOADS_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)


def get_file_path(filename: str, directory: str = "uploads") -> Path:
    """Get safe file path"""
    base_dir = UPLOADS_DIR if directory == "uploads" else PROCESSED_DIR
    return base_dir / filename


def save_uploaded_file(filename: str, content: bytes) -> Path:
    """Save uploaded file safely"""
    file_path = get_file_path(filename)
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path


def validate_file(filename: str, file_size: int, max_size_mb: int = 50) -> tuple[bool, str]:
    """Validate uploaded file"""
    allowed_extensions = {".csv", ".xlsx", ".xls"}
    file_ext = Path(filename).suffix.lower()

    if file_ext not in allowed_extensions:
        return False, f"File type {file_ext} not allowed. Use CSV or Excel files."

    max_bytes = max_size_mb * 1024 * 1024
    if file_size > max_bytes:
        return False, f"File size exceeds {max_size_mb}MB limit"

    return True, "Valid file"


def load_analysis_config() -> dict:
    """Load preprocessing configuration"""
    config_path = Path("config.json")
    if config_path.exists():
        with open(config_path, "r") as f:
            return json.load(f)
    return {
        "fill_strategy": "mean",
        "scaling_method": "standard",
        "outlier_threshold": 1.5,
        "variance_threshold": 0.01,
    }


def save_analysis_log(filename: str, analysis_data: dict):
    """Save analysis results to JSON"""
    log_dir = PROCESSED_DIR / "logs"
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f"{Path(filename).stem}_analysis.json"
    with open(log_file, "w") as f:
        json.dump(analysis_data, f, indent=2, default=str)

    return log_file


class ErrorResponse(Exception):
    """Custom exception for API errors"""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.detail)
