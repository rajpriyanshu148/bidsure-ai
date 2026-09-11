from pathlib import Path

from app.extraction.ocr_service import OCRService


def main():

    image_path = (
        Path(__file__).resolve().parents[3]
        / "data"
        / "test_scan.png"
    )

    print(
        f"Testing image:\n{image_path}"
    )

    ocr = OCRService()

    result = ocr.extract_text(
        str(image_path)
    )

    print("\n" + "=" * 60)
    print("              BIDSURE AI OCR")
    print("=" * 60)

    print(
        f"\nScript: "
        f"{result['script']}"
    )

    print(
        f"Script confidence: "
        f"{result['script_confidence']}"
    )

    print(
        f"Orientation: "
        f"{result['orientation']}"
    )

    print(
        f"\nLanguage: "
        f"{result['language']}"
    )

    print(
        f"Language code: "
        f"{result['language_code']}"
    )

    print(
        f"Language confidence: "
        f"{result['language_confidence']}"
    )

    print(
        f"\nTesseract models: "
        f"{result['ocr_language_models']}"
    )

    print(
        f"OCR confidence: "
        f"{result['ocr_confidence']}"
    )

    print(
        f"Extraction method: "
        f"{result['extraction_method']}"
    )

    print(
        f"Script detection: "
        f"{result['script_detection_method']}"
    )

    print("\n" + "-" * 60)
    print("EXTRACTED TEXT")
    print("-" * 60)

    print(result["text"])

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()