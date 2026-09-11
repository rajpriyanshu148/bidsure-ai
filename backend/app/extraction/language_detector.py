from dataclasses import dataclass


@dataclass
class LanguageDetectionResult:
    """Result of script/language detection."""

    language: str
    script: str
    confidence: float


class IndianLanguageDetector:
    """
    Detect likely Indian language/script and select
    an appropriate Tesseract language model.
    """

    SCRIPT_TO_LANGUAGE = {
        "Latin": {
            "language": "English",
            "tesseract": "eng",
        },
        "Devanagari": {
            "language": "Hindi/Marathi",
            "tesseract": "hin+mar+eng",
        },
        "Bengali": {
            "language": "Bengali/Assamese",
            "tesseract": "ben+asm+eng",
        },
        "Gujarati": {
            "language": "Gujarati",
            "tesseract": "guj+eng",
        },
        "Gurmukhi": {
            "language": "Punjabi",
            "tesseract": "pan+eng",
        },
        "Kannada": {
            "language": "Kannada",
            "tesseract": "kan+eng",
        },
        "Malayalam": {
            "language": "Malayalam",
            "tesseract": "mal+eng",
        },
        "Oriya": {
            "language": "Odia",
            "tesseract": "ori+eng",
        },
        "Tamil": {
            "language": "Tamil",
            "tesseract": "tam+eng",
        },
        "Telugu": {
            "language": "Telugu",
            "tesseract": "tel+eng",
        },
        "Arabic": {
            "language": "Urdu",
            "tesseract": "urd+eng",
        },
    }

    @classmethod
    def from_script(
        cls,
        script: str,
    ) -> LanguageDetectionResult:

        result = cls.SCRIPT_TO_LANGUAGE.get(
            script
        )

        if result is None:

            return LanguageDetectionResult(
                language="Unknown",
                script=script,
                confidence=0.0,
            )

        return LanguageDetectionResult(
            language=result["language"],
            script=script,
            confidence=0.80,
        )

    @classmethod
    def get_tesseract_languages(
        cls,
        script: str,
    ) -> str:

        result = cls.SCRIPT_TO_LANGUAGE.get(
            script
        )

        if result is None:
            return "eng"

        return result["tesseract"]