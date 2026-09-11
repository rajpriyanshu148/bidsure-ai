from dataclasses import dataclass

from langdetect import DetectorFactory, detect_langs
from langdetect.lang_detect_exception import LangDetectException


# Make language detection deterministic.
DetectorFactory.seed = 0


@dataclass
class LanguageClassificationResult:
    """Result of language classification."""

    language: str
    language_code: str
    confidence: float


class IndianLanguageClassifier:
    """
    Identify the most likely language from OCR text.

    This is a second-stage classifier:
    
        Script detection
              ↓
        OCR
              ↓
        Language classification
    """

    LANGUAGE_NAMES = {
        "en": "English",
        "hi": "Hindi",
        "bn": "Bengali",
        "as": "Assamese",
        "gu": "Gujarati",
        "kn": "Kannada",
        "ml": "Malayalam",
        "mr": "Marathi",
        "or": "Odia",
        "pa": "Punjabi",
        "ta": "Tamil",
        "te": "Telugu",
        "ur": "Urdu",
        "sa": "Sanskrit",
    }

    SUPPORTED_LANGUAGES = set(
        LANGUAGE_NAMES.keys()
    )

    @classmethod
    def classify(
        cls,
        text: str,
    ) -> LanguageClassificationResult:

        cleaned_text = text.strip()

        # Not enough text for reliable classification.
        if len(cleaned_text) < 20:

            return LanguageClassificationResult(
                language="Unknown",
                language_code="unknown",
                confidence=0.0,
            )

        try:
            predictions = detect_langs(
                cleaned_text
            )

        except LangDetectException:

            return LanguageClassificationResult(
                language="Unknown",
                language_code="unknown",
                confidence=0.0,
            )

        # Keep only languages relevant to Bidsure AI.
        predictions = [
            prediction
            for prediction in predictions
            if prediction.lang
            in cls.SUPPORTED_LANGUAGES
        ]

        if not predictions:

            return LanguageClassificationResult(
                language="Unknown",
                language_code="unknown",
                confidence=0.0,
            )

        best = predictions[0]

        return LanguageClassificationResult(
            language=cls.LANGUAGE_NAMES.get(
                best.lang,
                "Unknown",
            ),
            language_code=best.lang,
            confidence=round(
                float(best.prob),
                4,
            ),
        )