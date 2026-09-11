from app.extraction.language_classifier import (
    IndianLanguageClassifier,
)


def main():

    test_texts = {
        "English": (
            "Government tender notice "
            "for construction of a new road."
        ),

        "Hindi": (
            "यह एक सरकारी निविदा सूचना है "
            "जिसमें सड़क निर्माण का कार्य शामिल है।"
        ),

        "Marathi": (
            "ही एक सरकारी निविदा सूचना आहे "
            "ज्यामध्ये रस्ते बांधकामाचे काम समाविष्ट आहे."
        ),

        "Bengali": (
            "এটি একটি সরকারি দরপত্র বিজ্ঞপ্তি "
            "যেখানে রাস্তা নির্মাণের কাজ অন্তর্ভুক্ত রয়েছে।"
        ),

        "Gujarati": (
            "આ એક સરકારી ટેન્ડર સૂચના છે "
            "જેમાં રસ્તાના બાંધકામનું કામ સામેલ છે."
        ),

        "Tamil": (
            "இது ஒரு அரசு ஒப்பந்த அறிவிப்பு "
            "ஆகும் இதில் சாலை கட்டுமான பணி உள்ளது."
        ),

        "Telugu": (
            "ఇది ఒక ప్రభుత్వ టెండర్ నోటీసు "
            "దీనిలో రహదారి నిర్మాణ పనులు ఉన్నాయి."
        ),

        "Kannada": (
            "ಇದು ಸರ್ಕಾರಿ ಟೆಂಡರ್ ಸೂಚನೆಯಾಗಿದ್ದು "
            "ರಸ್ತೆ ನಿರ್ಮಾಣ ಕಾರ್ಯವನ್ನು ಒಳಗೊಂಡಿದೆ."
        ),
    }

    print(
        "\n========== LANGUAGE CLASSIFICATION =========="
    )

    for expected, text in test_texts.items():

        result = IndianLanguageClassifier.classify(
            text
        )

        print("\nExpected:", expected)
        print("Detected:", result.language)
        print("Code:", result.language_code)
        print("Confidence:", result.confidence)


if __name__ == "__main__":
    main()