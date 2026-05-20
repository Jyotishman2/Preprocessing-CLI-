# PrepAI Backend

Automated data preprocessing and analysis API built with FastAPI.

## Features

✅ **File Upload** - CSV and Excel file support  
✅ **Dataset Analysis** - Comprehensive EDA statistics  
✅ **Smart Preprocessing** - Automated pipeline with 6 steps  
✅ **AI Insights** - Built-in heuristics (Claude API optional)  
✅ **Data Export** - Download cleaned CSV and reports  

## Quick Start

### 1. Setup Virtual Environment

```bash
cd prepai-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start Server

```bash
python app.py
```

Server runs on: `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Health check |
| `POST` | `/upload` | Upload CSV/Excel file |
| `GET` | `/summary/{filename}` | Get dataset analysis |
| `POST` | `/preprocess/{filename}` | Run preprocessing pipeline |
| `GET` | `/download/{filename}` | Download cleaned CSV |
| `GET` | `/ai-suggestions/{filename}` | Get smart suggestions |
| `GET` | `/visualizations/{filename}` | Get chart data |
| `GET` | `/report/{filename}` | Download JSON report |

## AI Suggestions (Optional)

By default, PrepAI uses **built-in heuristics** - no API key required!

If you want Claude AI suggestions (optional, requires payment):

1. Get API key from https://console.anthropic.com
2. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
3. Install Anthropic SDK:
   ```bash
   pip install anthropic
   ```

The system will automatically use Claude API if available, otherwise uses heuristics.

## File Structure

```
prepai-backend/
├── app.py                  # FastAPI server
├── analysis.py             # EDA module
├── preprocessing.py        # Pipeline module
├── ai_suggestions.py       # Smart suggestions (no API required)
├── utils.py               # Helper functions
├── requirements.txt       # Dependencies
├── .env                   # Config (API keys)
├── uploads/               # Raw uploaded files
├── processed/             # Cleaned output files
└── README.md
```

## Example Usage

```bash
# 1. Upload file
curl -X POST -F "file=@data.csv" http://localhost:8000/upload

# 2. Get analysis
curl http://localhost:8000/summary/data.csv

# 3. Run preprocessing
curl -X POST http://localhost:8000/preprocess/data.csv

# 4. Get AI suggestions
curl http://localhost:8000/ai-suggestions/data.csv

# 5. Download cleaned data
curl http://localhost:8000/download/processed_data.csv > cleaned.csv
```

## Preprocessing Steps

1. **Fill Missing Values** - Mean/Median for numerical, Mode for categorical
2. **Remove Duplicates** - Exact row matching
3. **Encode Categorical** - OneHotEncoder (low cardinality) / LabelEncoder (high)
4. **Remove Outliers** - IQR-based filtering
5. **Scale Features** - StandardScaler or MinMaxScaler
6. **Drop Low Variance** - VarianceThreshold filtering

## Troubleshooting

**Port 8000 already in use:**
```bash
python app.py --port 8001
```

**ModuleNotFoundError:**
```bash
# Make sure venv is activated
pip install -r requirements.txt
```

**CORS errors:**
- Frontend must be at http://localhost:5173
- Update CORS origins in app.py if different

## License

MIT
