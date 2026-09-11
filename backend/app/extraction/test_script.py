from pathlib import Path

from app.extraction.script_detector import ScriptDetector


def main():
    image_path = (
        Path(__file__).resolve().parents[3]
        / "data"
        / "test_scan.png"
    )

    print(f"Testing image: {image_path}")

    if not image_path.exists():
        print("\nERROR: Test image does not exist!")
        print(f"Expected location: {image_path}")
        return

    result = ScriptDetector.detect(
        str(image_path)
    )

    print("\n========== SCRIPT DETECTION ==========")

    for key, value in result.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()