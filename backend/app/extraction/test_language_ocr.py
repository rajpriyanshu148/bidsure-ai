from pathlib import Path

from app.extraction.ocr_service import OCRService
from app.extraction.script_detector import ScriptDetector


def main():

    image_path = (
        Path(__file__).resolve().parents[3]
        / "data"
        / "test_scan.png"
    )

    print(
        f"Testing image: {image_path}"
    )

    # -----------------------------------------------
    # Script detection
    # -----------------------------------------------

    script_result = ScriptDetector.detect(
        str(image_path)
    )

    print("\n========== SCRIPT DETECTION ==========")

    for key, value in script_result.items():
        print(f"{key}: {value}")

    script = script_result.get(
        "script",
        "Unknown",
    )

    # -----------------------------------------------
    # Language selection
    # -----------------------------------------------

    language = OCRService.select_languages(
        script
    )

    print("\n========== LANGUAGE SELECTION ==========")
    print(f"Detected script: {script}")
    print(f"OCR languages: {language}")

    # -----------------------------------------------
    # OCR
    # -----------------------------------------------

    ocr = OCRService()

    result = ocr.extract_text(
        str(image_path),
        script=script,
    )

    print("\n========== OCR RESULT ==========")
    print(f"Language: {result['language']}")
    print(f"Script: {result['script']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Method: {result['extraction_method']}")

    print("\nText:")
    print(result["text"])


if __name__ == "__main__":
    main()