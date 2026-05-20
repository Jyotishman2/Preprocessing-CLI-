import pandas as pd
import numpy as np

from sklearn.preprocessing import (
    StandardScaler,
    MinMaxScaler,
    LabelEncoder,
)

from sklearn.feature_selection import VarianceThreshold

from typing import Dict, Any


class PreprocessingPipeline:
    """
    Advanced automated preprocessing pipeline
    """

    def __init__(self, config: Dict[str, Any] = None):

        self.config = config or {
            "fill_strategy": "mean",
            "scaling_method": "standard",
            "outlier_threshold": 1.5,
            "variance_threshold": 0.01,
            "remove_duplicates": True,
            "encode_categorical": True,
        }

        self.steps_log = []

        self.original_shape = None

    # ======================================================
    # MAIN PIPELINE
    # ======================================================

    def fit_transform(
        self,
        df: pd.DataFrame
    ):

        df = df.copy()

        self.original_shape = (
            int(df.shape[0]),
            int(df.shape[1])
        )

        try:

            # ==================================================
            # CLEAN HUMAN READABLE DATASET
            # ==================================================

            clean_df = df.copy()

            clean_df = self._clean_text_columns(clean_df)

            clean_df = self._fill_missing_values(clean_df)

            clean_df = self._remove_duplicates(clean_df)

            clean_df = self._remove_outliers(clean_df)

            # ==================================================
            # ML READY DATASET
            # ==================================================

            ml_df = clean_df.copy()

            ml_df = self._encode_categorical(ml_df)

            ml_df = self._scale_features(ml_df)

            ml_df = self._drop_low_variance(ml_df)

            return clean_df, ml_df, self.steps_log

        except Exception as e:

            raise Exception(
                f"Preprocessing failed: {str(e)}"
            )

    # ======================================================
    # CLEAN TEXT
    # ======================================================

    def _clean_text_columns(self, df: pd.DataFrame):

        categorical_cols = df.select_dtypes(
            include=["object", "category"]
        ).columns

        for col in categorical_cols:

            df[col] = (
                df[col]
                .astype(str)
                .str.strip()
                .str.title()
            )

        self.steps_log.append({
            "step": "clean-text",
            "status": "completed",
            "message":
                f"Cleaned {int(len(categorical_cols))} categorical columns",
        })

        return df

    # ======================================================
    # FILL MISSING VALUES
    # ======================================================

    def _fill_missing_values(self, df: pd.DataFrame):

        missing_count = int(
            df.isnull().sum().sum()
        )

        if missing_count == 0:

            self.steps_log.append({
                "step": "fill-missing",
                "status": "completed",
                "message": "No missing values found",
            })

            return df

        # ---------------------------
        # NUMERICAL COLUMNS
        # ---------------------------

        numerical_cols = df.select_dtypes(
            include=[np.number]
        ).columns

        for col in numerical_cols:

            if df[col].isnull().any():

                if self.config["fill_strategy"] == "median":

                    fill_value = float(
                        df[col].median()
                    )

                else:

                    fill_value = float(
                        df[col].mean()
                    )

                df[col] = df[col].fillna(
                    fill_value
                )

        # ---------------------------
        # CATEGORICAL COLUMNS
        # ---------------------------

        categorical_cols = df.select_dtypes(
            include=["object", "category"]
        ).columns

        for col in categorical_cols:

            if df[col].isnull().any():

                mode = df[col].mode()

                mode_value = (
                    str(mode.iloc[0])
                    if not mode.empty
                    else "Unknown"
                )

                df[col] = df[col].fillna(
                    mode_value
                )

        self.steps_log.append({
            "step": "fill-missing",
            "status": "completed",
            "message":
                f"Filled {missing_count} missing values",
        })

        return df

    # ======================================================
    # REMOVE DUPLICATES
    # ======================================================

    def _remove_duplicates(self, df: pd.DataFrame):

        if not self.config["remove_duplicates"]:

            return df

        original_len = int(len(df))

        df = df.drop_duplicates()

        removed = int(
            original_len - len(df)
        )

        self.steps_log.append({
            "step": "remove-duplicates",
            "status": "completed",
            "message":
                f"Removed {removed} duplicate rows",
        })

        return df

    # ======================================================
    # REMOVE OUTLIERS
    # ======================================================

    def _remove_outliers(self, df: pd.DataFrame):

        numerical_cols = [

            col for col in df.select_dtypes(
                include=[np.number]
            ).columns

            if "id" not in col.lower()
        ]

        original_len = int(len(df))

        for col in numerical_cols:

            try:

                Q1 = float(
                    df[col].quantile(0.25)
                )

                Q3 = float(
                    df[col].quantile(0.75)
                )

                IQR = float(Q3 - Q1)

                lower_bound = (
                    Q1 -
                    float(
                        self.config["outlier_threshold"]
                    ) * IQR
                )

                upper_bound = (
                    Q3 +
                    float(
                        self.config["outlier_threshold"]
                    ) * IQR
                )

                df = df[
                    (df[col] >= lower_bound)
                    & (df[col] <= upper_bound)
                ]

            except Exception:
                continue

        removed = int(
            original_len - len(df)
        )

        self.steps_log.append({
            "step": "remove-outliers",
            "status": "completed",
            "message":
                f"Removed {removed} outlier rows",
        })

        return df

    # ======================================================
    # ENCODE CATEGORICAL
    # ======================================================

    def _encode_categorical(self, df: pd.DataFrame):

        if not self.config["encode_categorical"]:

            return df

        categorical_cols = df.select_dtypes(
            include=["object", "category"]
        ).columns

        encoded_cols = []

        for col in categorical_cols:

            try:

                cardinality = int(
                    df[col].nunique()
                )

                # ==========================================
                # ONE HOT ENCODING
                # ==========================================

                if cardinality <= 10:

                    encoded = pd.get_dummies(
                        df[col],
                        prefix=col,
                        drop_first=False
                    )

                    encoded = encoded.astype(int)

                    df = pd.concat(
                        [
                            df.drop(col, axis=1),
                            encoded
                        ],
                        axis=1
                    )

                    encoded_cols.append(
                        f"{col} (one-hot)"
                    )

                # ==========================================
                # LABEL ENCODING
                # ==========================================

                else:

                    le = LabelEncoder()

                    df[col] = le.fit_transform(
                        df[col].astype(str)
                    )

                    df[col] = df[col].astype(int)

                    encoded_cols.append(
                        f"{col} (label)"
                    )

            except Exception:
                continue

        self.steps_log.append({
            "step": "encode-categorical",
            "status": "completed",
            "message":
                f"Encoded {int(len(categorical_cols))} columns",
            "columns_encoded": encoded_cols,
        })

        return df

    # ======================================================
    # SCALE FEATURES
    # ======================================================

    def _scale_features(self, df: pd.DataFrame):

        numerical_cols = [

            col for col in df.select_dtypes(
                include=[np.number]
            ).columns

            if "id" not in col.lower()
        ]

        if len(numerical_cols) == 0:

            return df

        try:

            # ==========================================
            # SCALER
            # ==========================================

            if self.config["scaling_method"] == "minmax":

                scaler = MinMaxScaler()

            else:

                scaler = StandardScaler()

            df[numerical_cols] = scaler.fit_transform(
                df[numerical_cols]
            )

            df[numerical_cols] = (
                df[numerical_cols]
                .astype(float)
            )

            self.steps_log.append({
                "step": "scale-features",
                "status": "completed",
                "message":
                    f"Scaled {int(len(numerical_cols))} columns",
                "columns_scaled":
                    list(map(str, numerical_cols)),
            })

        except Exception as e:

            self.steps_log.append({
                "step": "scale-features",
                "status": "failed",
                "message": str(e),
            })

        return df

    # ======================================================
    # DROP LOW VARIANCE FEATURES
    # ======================================================

    def _drop_low_variance(self, df: pd.DataFrame):

        numerical_cols = [

            col for col in df.select_dtypes(
                include=[np.number]
            ).columns

            if "id" not in col.lower()
        ]

        if len(numerical_cols) == 0:

            return df

        selector = VarianceThreshold(
            threshold=float(
                self.config["variance_threshold"]
            )
        )

        original_cols = list(numerical_cols)

        try:

            selector.fit(df[numerical_cols])

            kept_indices = selector.get_support()

            dropped_cols = [

                str(original_cols[i])

                for i, keep in enumerate(
                    kept_indices
                )

                if not keep
            ]

            if dropped_cols:

                df = df.drop(
                    dropped_cols,
                    axis=1
                )

            self.steps_log.append({
                "step": "drop-variance",
                "status": "completed",
                "message":
                    f"Dropped {int(len(dropped_cols))} columns",
                "columns_dropped":
                    dropped_cols,
            })

        except Exception as e:

            self.steps_log.append({
                "step": "drop-variance",
                "status": "failed",
                "message": str(e),
            })

        return df