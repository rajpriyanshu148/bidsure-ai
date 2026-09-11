from pathlib import Path

import cv2
import numpy as np
import pytesseract

from app.extraction.language_classifier import (
    IndianLanguageClassifier,
)
from app.extraction.script_detector import (
    ScriptDetector,
)
from app.extraction.text_script_analyzer import (
    TextScriptAnalyzer,
)


class OCRService:
    """
    Multilingual OCR service for Indian documents.

    Pipeline:

        Image
          ↓
        Script Detection
          ↓
        Initial Language Selection
          ↓
        Image Preprocessing
          ↓
        OCR
          ↓
        Unicode Script Analysis
          ↓
        Mixed-Script Detection
          ↓
        Optional Mixed-Language OCR
          ↓
        Language Classification
          ↓
        Confidence Scoring
    """

    # ---------------------------------------------------------
    # Script → Tesseract language models
    # ---------------------------------------------------------

    SCRIPT_LANGUAGES = {
        "Latin": [
            "eng",
        ],

        "Devanagari": [
            "hin",
            "mar",
            "san",
            "kok",
        ],

        "Bengali": [
            "ben",
            "asm",
        ],

        "Gujarati": [
            "guj",
        ],

        "Gurmukhi": [
            "pan",
        ],

        "Kannada": [
            "kan",
        ],

        "Malayalam": [
            "mal",
        ],

        "Oriya": [
            "ori",
        ],

        "Tamil": [
            "tam",
        ],

        "Telugu": [
            "tel",
        ],

        "Arabic": [
            "urd",
        ],
    }

    # ---------------------------------------------------------
    # Constructor
    # ---------------------------------------------------------

    def __init__(
        self,
        language: str | None = None,
    ):
        """
        Parameters
        ----------
        language:
            Optional manually selected Tesseract language.

            Example:
                OCRService(language="eng")
                OCRService(language="hin")
                OCRService(language="eng+hin")

            If None, the system automatically selects
            appropriate language models.
        """

        self.language = language

    # =========================================================
    # IMAGE PREPROCESSING
    # =========================================================

    @staticmethod
    def preprocess_image(
        image: np.ndarray,
    ) -> np.ndarray:
        """
        Prepare an image for OCR.

        Steps:

        1. Convert to grayscale
        2. Reduce noise
        3. Improve contrast
        4. Adaptive thresholding
        """

        if image is None:
            raise ValueError(
                "Invalid image supplied for preprocessing."
            )

        # Convert BGR → grayscale
        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        # Remove small noise
        gray = cv2.GaussianBlur(
            gray,
            (3, 3),
            0,
        )

        # Improve contrast
        gray = cv2.equalizeHist(
            gray
        )

        # Adaptive threshold
        processed = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            31,
            11,
        )

        return processed

    # =========================================================
    # DESKEW
    # =========================================================

    @staticmethod
    def deskew_image(
        image: np.ndarray,
    ) -> np.ndarray:
        """
        Correct small rotations in scanned documents.
        """

        if image is None:
            raise ValueError(
                "Invalid image supplied for deskewing."
            )

        coords = np.column_stack(
            np.where(image < 255)
        )

        # Not enough foreground pixels
        if len(coords) < 10:
            return image

        angle = cv2.minAreaRect(
            coords
        )[-1]

        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        height, width = image.shape[:2]

        center = (
            width // 2,
            height // 2,
        )

        rotation_matrix = (
            cv2.getRotationMatrix2D(
                center,
                angle,
                1.0,
            )
        )

        rotated = cv2.warpAffine(
            image,
            rotation_matrix,
            (width, height),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )

        return rotated

    # =========================================================
    # TESSERACT LANGUAGES
    # =========================================================

    @staticmethod
    def get_installed_languages() -> list[str]:
        """
        Return Tesseract language models installed
        on the current machine.
        """

        return pytesseract.get_languages(
            config=""
        )

    # =========================================================
    # SINGLE SCRIPT LANGUAGE SELECTION
    # =========================================================

    @classmethod
    def select_languages(
        cls,
        script: str,
    ) -> str:
        """
        Select available Tesseract models for one script.
        """

        installed = set(
            cls.get_installed_languages()
        )

        candidates = cls.SCRIPT_LANGUAGES.get(
            script,
            ["eng"],
        )

        available = []

        for language in candidates:

            if language in installed:
                available.append(language)

        # English is important for Indian tenders because
        # documents frequently mix English with local languages.
        if (
            "eng" in installed
            and "eng" not in available
        ):
            available.append("eng")

        if not available:

            if "eng" in installed:
                return "eng"

            return candidates[0]

        return "+".join(available)

    # =========================================================
    # MULTIPLE SCRIPT LANGUAGE SELECTION
    # =========================================================

    @classmethod
    def select_languages_for_scripts(
        cls,
        scripts: list[str],
    ) -> str:
        """
        Select Tesseract models for multiple detected scripts.

        Example:

            ["Latin", "Devanagari"]

        may become:

            eng+hin+mar+san+kok
        """

        installed = set(
            cls.get_installed_languages()
        )

        selected = []

        for script in scripts:

            candidates = (
                cls.SCRIPT_LANGUAGES.get(
                    script,
                    [],
                )
            )

            for language in candidates:

                if (
                    language in installed
                    and language not in selected
                ):
                    selected.append(language)

        # English should be first for mixed Indian
        # government documents.
        if "eng" in installed:

            if "eng" in selected:
                selected.remove("eng")

            selected.insert(
                0,
                "eng",
            )

        if not selected:

            if "eng" in installed:
                return "eng"

            return "eng"

        return "+".join(selected)

    # =========================================================
    # OCR CONFIDENCE
    # =========================================================

    @staticmethod
    def calculate_confidence(
        data: dict,
    ) -> float:
        """
        Calculate average OCR confidence.

        Tesseract returns confidence values between
        0 and 100 for recognized words.
        """

        confidences = []

        for value in data.get(
            "conf",
            [],
        ):

            try:

                confidence = float(
                    value
                )

                if confidence >= 0:

                    confidences.append(
                        confidence
                    )

            except (
                ValueError,
                TypeError,
            ):
                continue

        if not confidences:
            return 0.0

        return round(
            sum(confidences)
            / len(confidences),
            2,
        )

    # =========================================================
    # OCR
    # =========================================================

    @staticmethod
    def run_ocr(
        image: np.ndarray,
        language: str,
    ) -> tuple[str, dict, float]:
        """
        Run Tesseract OCR.

        Returns:

            text
            OCR data
            confidence
        """

        text = pytesseract.image_to_string(
            image,
            lang=language,
            config="--psm 6",
        ).strip()

        data = pytesseract.image_to_data(
            image,
            lang=language,
            config="--psm 6",
            output_type=pytesseract.Output.DICT,
        )

        confidence = (
            OCRService.calculate_confidence(
                data
            )
        )

        return (
            text,
            data,
            confidence,
        )

    # =========================================================
    # COMPLETE IMAGE PIPELINE
    # =========================================================

    def extract_image(
        self,
        image: np.ndarray,
        script: str | None = None,
    ) -> dict:
        """
        Complete multilingual OCR pipeline.

        Steps:

        1. Detect dominant script
        2. Preprocess image
        3. Select OCR language models
        4. Run OCR
        5. Analyze scripts present in OCR text
        6. Detect mixed-script document
        7. Retry OCR using multiple models when necessary
        8. Classify language
        9. Calculate confidence
        """

        if image is None:
            raise ValueError(
                "Invalid image supplied."
            )

        # =====================================================
        # 1. SCRIPT DETECTION
        # =====================================================

        if script is None:

            script_result = (
                ScriptDetector.detect_image(
                    image
                )
            )

            detected_script = (
                script_result.get(
                    "script",
                    "Unknown",
                )
            )

        else:

            detected_script = script

            script_result = {
                "script": script,
                "orientation": "Unknown",
                "script_confidence": 0.0,
                "detection_method": "provided",
            }

        # =====================================================
        # 2. IMAGE PREPROCESSING
        # =====================================================

        processed = (
            self.preprocess_image(
                image
            )
        )

        processed = (
            self.deskew_image(
                processed
            )
        )

        # =====================================================
        # 3. INITIAL LANGUAGE SELECTION
        # =====================================================

        if self.language:

            selected_language = (
                self.language
            )

        else:

            selected_language = (
                self.select_languages(
                    detected_script
                )
            )

        # =====================================================
        # 4. INITIAL OCR
        # =====================================================

        (
            text,
            data,
            ocr_confidence,
        ) = self.run_ocr(
            processed,
            selected_language,
        )

        # =====================================================
        # 5. ANALYZE SCRIPTS IN OCR TEXT
        # =====================================================

        text_script_result = (
            TextScriptAnalyzer.detect(
                text
            )
        )

        detected_scripts = (
            text_script_result.get(
                "scripts",
                [],
            )
        )

        # =====================================================
        # 6. MIXED-SCRIPT DETECTION
        # =====================================================

        mixed_script = (
            len(detected_scripts) > 1
        )

        # =====================================================
        # 7. MIXED-LANGUAGE OCR RETRY
        # =====================================================

        if (
            mixed_script
            and not self.language
        ):

            mixed_language = (
                self.select_languages_for_scripts(
                    detected_scripts
                )
            )

            # Only retry if the language configuration
            # is actually different.
            if (
                mixed_language
                != selected_language
            ):

                (
                    retry_text,
                    retry_data,
                    retry_confidence,
                ) = self.run_ocr(
                    processed,
                    mixed_language,
                )

                # Accept the retry if it produced text.
                if retry_text:

                    text = retry_text

                    data = retry_data

                    ocr_confidence = (
                        retry_confidence
                    )

                    selected_language = (
                        mixed_language
                    )

                    # Re-analyze scripts after retry.
                    text_script_result = (
                        TextScriptAnalyzer.detect(
                            text
                        )
                    )

                    detected_scripts = (
                        text_script_result.get(
                            "scripts",
                            [],
                        )
                    )

        # =====================================================
        # 8. LANGUAGE CLASSIFICATION
        # =====================================================

        language_result = (
            IndianLanguageClassifier.classify(
                text
            )
        )

        # =====================================================
        # 9. FINAL RESULT
        # =====================================================

        return {
            # Extracted OCR text
            "text": text,

            # Dominant script from Tesseract OSD
            "script": detected_script,

            # All scripts detected from OCR text
            "detected_scripts": (
                detected_scripts
            ),

            # Percentage of each script
            "script_distribution": (
                text_script_result.get(
                    "percentages",
                    {},
                )
            ),

            # Whether page contains multiple scripts
            "mixed_script": mixed_script,

            # OSD confidence
            "script_confidence": (
                script_result.get(
                    "script_confidence",
                    0.0,
                )
            ),

            # Page orientation
            "orientation": (
                script_result.get(
                    "orientation",
                    "Unknown",
                )
            ),

            # Classified language
            "language": (
                language_result.language
            ),

            # ISO language code
            "language_code": (
                language_result.language_code
            ),

            # Language classifier confidence
            "language_confidence": (
                language_result.confidence
            ),

            # Tesseract models actually used
            "ocr_language_models": (
                selected_language
            ),

            # OCR confidence
            "ocr_confidence": (
                ocr_confidence
            ),

            # Extraction method
            "extraction_method": "ocr",

            # How script was detected
            "script_detection_method": (
                script_result.get(
                    "detection_method",
                    "unknown",
                )
            ),
        }

    # =========================================================
    # FILE-BASED OCR
    # =========================================================

    def extract_text(
        self,
        image_path: str,
        script: str | None = None,
    ) -> dict:
        """
        Run the complete OCR pipeline on an image file.
        """

        path = Path(
            image_path
        )

        if not path.exists():

            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        image = cv2.imread(
            str(path)
        )

        if image is None:

            raise ValueError(
                f"Could not read image: {image_path}"
            )

        return self.extract_image(
            image,
            script=script,
        )