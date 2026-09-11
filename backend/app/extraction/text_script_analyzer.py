import unicodedata


class TextScriptAnalyzer:
    """
    Detect writing scripts from extracted OCR text.

    This analyzes the actual Unicode characters produced
    by OCR, allowing detection of mixed-script documents.
    """

    SCRIPT_RANGES = {
        "Latin": [
            ("LATIN",),
        ],

        "Devanagari": [
            ("DEVANAGARI",),
        ],

        "Bengali": [
            ("BENGALI",),
        ],

        "Gujarati": [
            ("GUJARATI",),
        ],

        "Gurmukhi": [
            ("GURMUKHI",),
        ],

        "Kannada": [
            ("KANNADA",),
        ],

        "Malayalam": [
            ("MALAYALAM",),
        ],

        "Oriya": [
            ("ORIYA",),
        ],

        "Tamil": [
            ("TAMIL",),
        ],

        "Telugu": [
            ("TELUGU",),
        ],

        "Arabic": [
            ("ARABIC",),
        ],
    }

    @classmethod
    def detect(
        cls,
        text: str,
    ) -> dict:
        """
        Detect scripts present in OCR text.

        Returns script counts and percentages.
        """

        script_counts = {}

        total_script_characters = 0

        for character in text:

            if not character.isalpha():
                continue

            unicode_name = unicodedata.name(
                character,
                "",
            ).upper()

            detected_script = None

            for script, prefixes in (
                cls.SCRIPT_RANGES.items()
            ):

                for prefix in prefixes:

                    if any(
                        name_part in unicode_name
                        for name_part in prefix
                    ):
                        detected_script = script
                        break

                if detected_script:
                    break

            if detected_script:

                script_counts[
                    detected_script
                ] = (
                    script_counts.get(
                        detected_script,
                        0,
                    )
                    + 1
                )

                total_script_characters += 1

        percentages = {}

        if total_script_characters:

            for script, count in (
                script_counts.items()
            ):

                percentages[script] = round(
                    (
                        count
                        / total_script_characters
                    )
                    * 100,
                    2,
                )

        scripts = sorted(
            script_counts,
            key=script_counts.get,
            reverse=True,
        )

        return {
            "scripts": scripts,
            "counts": script_counts,
            "percentages": percentages,
            "total_script_characters": (
                total_script_characters
            ),
        }