import pandas as pd
import numpy as np

from typing import Dict, Any


# ==========================================================
# SAFE CONVERTER
# ==========================================================

def safe_value(value):

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    if pd.isna(value):
        return None

    return value


# ==========================================================
# DETECT COLUMN TYPE
# ==========================================================

def detect_column_type(series: pd.Series) -> str:

    try:

        if pd.api.types.is_bool_dtype(series):

            return "boolean"

        elif pd.api.types.is_datetime64_any_dtype(series):

            return "datetime"

        elif pd.api.types.is_numeric_dtype(series):

            return "numerical"

        elif (
            pd.api.types.is_object_dtype(series)
            or
            pd.api.types.is_categorical_dtype(series)
        ):

            if series.dtype == "object":

                try:

                    pd.to_numeric(
                        series.dropna()
                    )

                    return "numerical"

                except Exception:

                    return "categorical"

            return "categorical"

        return "unknown"

    except Exception:

        return "unknown"


# ==========================================================
# MAIN ANALYSIS
# ==========================================================

def analyze_dataset(
    df: pd.DataFrame
) -> Dict[str, Any]:

    try:

        analysis = {

            "row_count":
                int(len(df)),

            "column_count":
                int(len(df.columns)),

            "columns":
                [],

            "missing_values":
                {},

            "missing_percentage":
                0.0,

            "duplicate_count":
                int(df.duplicated().sum()),

            "numerical_columns":
                0,

            "categorical_columns":
                0,

            "datetime_columns":
                0,

            "boolean_columns":
                0,

            "statistics":
                {},

            "correlations":
                {},

            "class_imbalance":
                {},
        }

        # ==================================================
        # OVERALL MISSING %
        # ==================================================

        total_cells = int(
            len(df) * len(df.columns)
        )

        missing_cells = int(
            df.isnull().sum().sum()
        )

        if total_cells > 0:

            analysis["missing_percentage"] = round(
                (missing_cells / total_cells) * 100,
                2
            )

        # ==================================================
        # COLUMN ANALYSIS
        # ==================================================

        for col in df.columns:

            try:

                column_type = detect_column_type(
                    df[col]
                )

                col_info = {

                    "name":
                        str(col),

                    "dtype":
                        str(df[col].dtype),

                    "missing":
                        int(
                            df[col]
                            .isnull()
                            .sum()
                        ),

                    "missing_pct":
                        round(
                            (
                                df[col]
                                .isnull()
                                .sum()
                                / max(len(df), 1)
                            ) * 100,
                            2
                        ),

                    "unique_values":
                        int(
                            df[col]
                            .nunique()
                        ),

                    "type":
                        column_type,
                }

                # ==========================================
                # NUMERICAL
                # ==========================================

                if column_type == "numerical":

                    analysis[
                        "numerical_columns"
                    ] += 1

                    numeric_series = pd.to_numeric(
                        df[col],
                        errors="coerce"
                    )

                    col_info["stats"] = {

                        "mean":
                            safe_value(
                                numeric_series.mean()
                            ),

                        "median":
                            safe_value(
                                numeric_series.median()
                            ),

                        "std":
                            safe_value(
                                numeric_series.std()
                            ),

                        "min":
                            safe_value(
                                numeric_series.min()
                            ),

                        "max":
                            safe_value(
                                numeric_series.max()
                            ),

                        "q25":
                            safe_value(
                                numeric_series.quantile(0.25)
                            ),

                        "q75":
                            safe_value(
                                numeric_series.quantile(0.75)
                            ),
                    }

                    # ======================================
                    # OUTLIERS
                    # ======================================

                    q1 = numeric_series.quantile(0.25)

                    q3 = numeric_series.quantile(0.75)

                    iqr = q3 - q1

                    outliers = (

                        (
                            numeric_series
                            <
                            (q1 - 1.5 * iqr)
                        )

                        |

                        (
                            numeric_series
                            >
                            (q3 + 1.5 * iqr)
                        )

                    ).sum()

                    col_info["outliers"] = int(
                        outliers
                    )

                # ==========================================
                # CATEGORICAL
                # ==========================================

                elif column_type == "categorical":

                    analysis[
                        "categorical_columns"
                    ] += 1

                    top_values = (
                        df[col]
                        .value_counts()
                        .head(5)
                        .to_dict()
                    )

                    safe_top_values = {

                        str(k): int(v)

                        for k, v in top_values.items()
                    }

                    col_info["top_values"] = (
                        safe_top_values
                    )

                    col_info["cardinality"] = int(
                        df[col].nunique()
                    )

                # ==========================================
                # BOOLEAN
                # ==========================================

                elif column_type == "boolean":

                    analysis[
                        "boolean_columns"
                    ] += 1

                    col_info["true_count"] = int(
                        (df[col] == True).sum()
                    )

                    col_info["false_count"] = int(
                        (df[col] == False).sum()
                    )

                # ==========================================
                # DATETIME
                # ==========================================

                elif column_type == "datetime":

                    analysis[
                        "datetime_columns"
                    ] += 1

                    col_info["min_date"] = str(
                        df[col].min()
                    )

                    col_info["max_date"] = str(
                        df[col].max()
                    )

                analysis["columns"].append(
                    col_info
                )

                analysis["missing_values"][str(col)] = int(
                    df[col]
                    .isnull()
                    .sum()
                )

            except Exception as col_error:

                print(
                    f"Column analysis failed for {col}: {col_error}"
                )

                continue

        # ==================================================
        # CORRELATIONS
        # ==================================================

        try:

            numerical_cols = (
                df.select_dtypes(
                    include=[np.number]
                )
                .columns
                .tolist()
            )

            if len(numerical_cols) > 1:

                corr_matrix = (

                    df[numerical_cols]

                    .corr()

                    .fillna(0)

                    .round(4)

                    .to_dict()
                )

                safe_corr = {}

                for k, v in corr_matrix.items():

                    safe_corr[str(k)] = {

                        str(inner_k):
                        float(inner_v)

                        for inner_k, inner_v
                        in v.items()
                    }

                analysis["correlations"] = (
                    safe_corr
                )

        except Exception as corr_error:

            print(
                f"Correlation error: {corr_error}"
            )

        # ==================================================
        # CLASS IMBALANCE
        # ==================================================

        try:

            for col in df.select_dtypes(
                include=["object", "category"]
            ).columns:

                if df[col].nunique() <= 10:

                    dist = (

                        df[col]

                        .value_counts(
                            normalize=True
                        )

                        .to_dict()
                    )

                    analysis["class_imbalance"][str(col)] = {

                        str(k):
                        round(float(v), 4)

                        for k, v
                        in dist.items()
                    }

        except Exception as imbalance_error:

            print(
                f"Imbalance error: {imbalance_error}"
            )

        return analysis

    except Exception as e:

        raise Exception(
            f"Analysis failed: {str(e)}"
        )


# ==========================================================
# QUICK SUMMARY
# ==========================================================

def get_summary_stats(
    df: pd.DataFrame
) -> Dict[str, Any]:

    analysis = analyze_dataset(df)

    return {

        "row_count":
            int(
                analysis["row_count"]
            ),

        "column_count":
            int(
                analysis["column_count"]
            ),

        "missing_percentage":
            float(
                analysis["missing_percentage"]
            ),

        "duplicate_count":
            int(
                analysis["duplicate_count"]
            ),

        "numerical_columns":
            int(
                analysis["numerical_columns"]
            ),

        "categorical_columns":
            int(
                analysis["categorical_columns"]
            ),

        "columns": [

            {
                "name":
                    str(c["name"]),

                "type":
                    str(c["type"]),

                "missing_pct":
                    float(
                        c["missing_pct"]
                    ),
            }

            for c in analysis["columns"]
        ],
    }