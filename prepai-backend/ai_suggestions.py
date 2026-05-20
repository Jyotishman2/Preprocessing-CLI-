from typing import Dict, Any, List
import os
import json
import numpy as np


class AISuggestions:
    """
    AI-powered suggestions
    Uses Claude API if available
    Falls back to heuristic analysis
    """

    def __init__(self):

        api_key = os.getenv(
            "ANTHROPIC_API_KEY"
        )

        self.has_api = bool(api_key)

        if self.has_api:

            try:

                from anthropic import Anthropic

                self.client = Anthropic(
                    api_key=api_key
                )

            except ImportError:

                self.has_api = False

    # ======================================================
    # SAFE CONVERSION
    # ======================================================

    def _safe(self, value):

        if isinstance(value, np.integer):
            return int(value)

        if isinstance(value, np.floating):
            return float(value)

        if isinstance(value, np.ndarray):
            return value.tolist()

        return value

    # ======================================================
    # MAIN METHOD
    # ======================================================

    def get_suggestions(
        self,
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:

        try:

            if self.has_api:

                return self._get_claude_suggestions(
                    analysis
                )

            return self._get_heuristic_suggestions(
                analysis
            )

        except Exception as e:

            print(
                f"Suggestions generation error: {e}"
            )

            return self._get_heuristic_suggestions(
                analysis
            )

    # ======================================================
    # CLAUDE API
    # ======================================================

    def _get_claude_suggestions(
        self,
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:

        try:

            summary = self._prepare_analysis_summary(
                analysis
            )

            message = self.client.messages.create(

                model="claude-3-5-sonnet-20241022",

                max_tokens=1024,

                messages=[
                    {
                        "role": "user",
                        "content":
                        f"""
Analyze this dataset and provide ML recommendations.

{summary}

Return JSON:

{{
    "preprocessing_suggestion": "...",
    "ml_models": ["model1"],
    "feature_engineering": ["idea1"]
}}
"""
                    }
                ],
            )

            response_text = (
                message.content[0].text
            )

            try:

                import re

                json_match = re.search(
                    r"\{.*\}",
                    response_text,
                    re.DOTALL
                )

                if json_match:

                    suggestions = json.loads(
                        json_match.group()
                    )

                else:

                    suggestions = (
                        self._parse_response_fallback(
                            response_text
                        )
                    )

            except Exception:

                suggestions = (
                    self._parse_response_fallback(
                        response_text
                    )
                )

            quality_score = (
                self._calculate_quality_score(
                    analysis
                )
            )

            response = {

                "quality_score":
                    int(quality_score),

                "quality_feedback":
                    self._get_quality_feedback(
                        quality_score
                    ),

                "suggestions": [
                    suggestions.get(
                        "preprocessing_suggestion",
                        "No suggestions available"
                    )
                ],

                "model_recommendations":
                    suggestions.get(
                        "ml_models",
                        [
                            "Classification",
                            "Regression"
                        ]
                    ),

                "feature_engineering":
                    suggestions.get(
                        "feature_engineering",
                        []
                    ),
            }

            return json.loads(
                json.dumps(
                    response,
                    default=self._safe
                )
            )

        except Exception as e:

            print(f"Claude API error: {e}")

            return self._get_heuristic_suggestions(
                analysis
            )

    # ======================================================
    # SUMMARY PREP
    # ======================================================

    def _prepare_analysis_summary(
        self,
        analysis: Dict[str, Any]
    ) -> str:

        return f"""
Dataset Shape:
{analysis.get('row_count', 0)} rows ×
{analysis.get('column_count', 0)} columns

Missing Data:
{analysis.get('missing_percentage', 0):.1f}%

Duplicates:
{analysis.get('duplicate_count', 0)} rows

Numerical Columns:
{analysis.get('numerical_columns', 0)}

Categorical Columns:
{analysis.get('categorical_columns', 0)}
"""

    # ======================================================
    # QUALITY SCORE
    # ======================================================

    def _calculate_quality_score(
        self,
        analysis: Dict[str, Any]
    ) -> int:

        score = 100

        missing_pct = float(
            analysis.get(
                "missing_percentage",
                0
            )
        )

        score -= min(
            missing_pct * 0.5,
            30
        )

        duplicate_count = int(
            analysis.get(
                "duplicate_count",
                0
            )
        )

        row_count = max(
            int(
                analysis.get(
                    "row_count",
                    1
                )
            ),
            1
        )

        if duplicate_count > row_count * 0.05:

            score -= 10

        num_cols = int(
            analysis.get(
                "numerical_columns",
                0
            )
        )

        cat_cols = int(
            analysis.get(
                "categorical_columns",
                0
            )
        )

        if num_cols > 0 and cat_cols > 0:

            score += 5

        for col_info in analysis.get(
            "columns",
            []
        ):

            outliers = int(
                col_info.get(
                    "outliers",
                    0
                )
            )

            if outliers > 0:

                score -= 2

        return int(
            max(0, min(100, score))
        )

    # ======================================================
    # QUALITY FEEDBACK
    # ======================================================

    def _get_quality_feedback(
        self,
        score: int
    ) -> str:

        if score >= 90:
            return "Excellent data quality"

        elif score >= 80:
            return "Good data quality"

        elif score >= 70:
            return "Moderate data quality"

        elif score >= 60:
            return "Fair data quality"

        return "Poor data quality"

    # ======================================================
    # FALLBACK PARSER
    # ======================================================

    def _parse_response_fallback(
        self,
        response_text: str
    ) -> Dict[str, Any]:

        return {

            "preprocessing_suggestion":
                response_text[:200],

            "ml_models": [
                "Classification",
                "Regression",
                "Clustering"
            ],

            "feature_engineering": [
                "Feature scaling",
                "Outlier removal",
                "Feature selection"
            ],
        }

    # ======================================================
    # HEURISTIC SUGGESTIONS
    # ======================================================

    def _get_heuristic_suggestions(
        self,
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:

        quality_score = (
            self._calculate_quality_score(
                analysis
            )
        )

        suggestions = []

        ml_models = []

        feature_engineering = []

        row_count = int(
            analysis.get(
                "row_count",
                0
            )
        )

        missing_pct = float(
            analysis.get(
                "missing_percentage",
                0
            )
        )

        categorical_cols = int(
            analysis.get(
                "categorical_columns",
                0
            )
        )

        numerical_cols = int(
            analysis.get(
                "numerical_columns",
                0
            )
        )

        duplicate_count = int(
            analysis.get(
                "duplicate_count",
                0
            )
        )

        # ==================================================
        # SUGGESTIONS
        # ==================================================

        if missing_pct > 20:

            suggestions.append(
                f"High missing data ({missing_pct:.1f}%). Use advanced imputation techniques."
            )

        elif missing_pct > 5:

            suggestions.append(
                f"Moderate missing data ({missing_pct:.1f}%). Mean/median imputation recommended."
            )

        if (
            row_count > 0 and
            duplicate_count > row_count * 0.02
        ):

            suggestions.append(
                f"Found {duplicate_count} duplicate rows. Remove duplicates before training."
            )

        outlier_count = sum(
            int(
                col.get(
                    "outliers",
                    0
                )
            )
            for col in analysis.get(
                "columns",
                []
            )
        )

        if outlier_count > 0:

            suggestions.append(
                f"Detected {outlier_count} outliers. Consider robust scaling."
            )

        if not suggestions:

            suggestions.append(
                "Dataset looks clean and ready for modeling."
            )

        # ==================================================
        # MODEL RECOMMENDATIONS
        # ==================================================

        if categorical_cols > 0 and numerical_cols > 0:

            ml_models = [
                "Classification",
                "Regression",
                "Clustering"
            ]

        elif numerical_cols > categorical_cols:

            ml_models = [
                "Regression",
                "Forecasting",
                "Anomaly Detection"
            ]

        else:

            ml_models = [
                "Classification",
                "Clustering"
            ]

        # ==================================================
        # FEATURE ENGINEERING
        # ==================================================

        if numerical_cols >= 2:

            feature_engineering.append(
                "Create interaction features"
            )

        if categorical_cols >= 2:

            feature_engineering.append(
                "One-hot encode categorical columns"
            )

        if numerical_cols > 5:

            feature_engineering.append(
                "Apply feature selection"
            )

        feature_engineering.append(
            "Scale numerical features"
        )

        response = {

            "quality_score":
                int(quality_score),

            "quality_feedback":
                self._get_quality_feedback(
                    quality_score
                ),

            "suggestions":
                suggestions[:3],

            "model_recommendations":
                ml_models,

            "feature_engineering":
                feature_engineering[:3],
        }

        return json.loads(
            json.dumps(
                response,
                default=self._safe
            )
        )