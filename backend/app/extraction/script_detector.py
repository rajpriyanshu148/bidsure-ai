from pathlib import Path

import cv2
import numpy as np
import pytesseract
from pytesseract import TesseractError


class ScriptDetector:
    """Detect writing script and orientation."""

    @staticmethod
    def _parse_osd(result: str) -> dict:
        """Convert Tesseract OSD output into a dictionary."""

        data = {}

        for line in result.splitlines():

            if ":" not in line:
                continue

            key, value = line.split(":", 1)

            data[key.strip()] = value.strip()

        return data

    @classmethod
    def detect_image(
        cls,
        image: np.ndarray,
    ) -> dict:
        """Detect script directly from an OpenCV image."""

        if image is None:
            raise ValueError(
                "Invalid image supplied to script detector."
            )

        # Upscale small images.
        height, width = image.shape[:2]

        if width < 1500:

            scale = 1500 / width

            image = cv2.resize(
                image,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_CUBIC,
            )

        try:

            result = pytesseract.image_to_osd(
                image,
                config="--psm 0 --dpi 300",
            )

            data = cls._parse_osd(result)

            if "Script" in data:

                return {
                    "script": data.get(
                        "Script",
                        "Unknown",
                    ),
                    "orientation": data.get(
                        "Orientation in degrees",
                        "Unknown",
                    ),
                    "script_confidence": float(
                        data.get(
                            "Script confidence",
                            0,
                        )
                    ),
                    "detection_method": "tesseract_osd",
                }

        except (
            TesseractError,
            RuntimeError,
            ValueError,
        ):
            pass

        return {
            "script": "Unknown",
            "orientation": "Unknown",
            "script_confidence": 0.0,
            "detection_method": "fallback",
        }

    @classmethod
    def detect(
        cls,
        image_path: str,
    ) -> dict:
        """Detect script from an image file."""

        path = Path(image_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        image = cv2.imread(str(path))

        if image is None:
            raise ValueError(
                f"Could not read image: {image_path}"
            )

        return cls.detect_image(image)