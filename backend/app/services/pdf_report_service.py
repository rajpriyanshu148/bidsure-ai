import io
from datetime import datetime, timezone
from typing import Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


class PDFReportService:
    @staticmethod
    def generate_compliance_report(
        tender: Any,
        bidder: Any,
        compliance_results: list,
        risk_score: Any,
        recommendation: Any,
        decision: Any,
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "GovTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0B2545"),
            alignment=1,  # Centered
        )

        subtitle_style = ParagraphStyle(
            "GovSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#134074"),
            alignment=1,
        )

        section_heading = ParagraphStyle(
            "GovSection",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0B2545"),
            spaceBefore=8,
            spaceAfter=4,
        )

        body_style = ParagraphStyle(
            "GovBody",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1E293B"),
        )

        badge_fail = ParagraphStyle("BFail", parent=body_style, textColor=colors.HexColor("#DC2626"), fontName="Helvetica-Bold")
        badge_pass = ParagraphStyle("BPass", parent=body_style, textColor=colors.HexColor("#059669"), fontName="Helvetica-Bold")
        badge_warn = ParagraphStyle("BWarn", parent=body_style, textColor=colors.HexColor("#D97706"), fontName="Helvetica-Bold")

        story = []

        # Header
        story.append(Paragraph("<b>GOVERNMENT E-MARKETPLACE (GeM)</b>", subtitle_style))
        story.append(Paragraph("<b>BIDSURE AI — BID COMPLIANCE & DECISION REPORT</b>", title_style))
        story.append(Paragraph("Automated Evidence-Backed Technical Evaluation Dossier", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0B2545"), spaceAfter=10))

        # Executive Summary Box
        score_val = f"{bidder.compliance_score:.1f} / 100"
        risk_val = bidder.risk_level
        risk_color = "#DC2626" if risk_val == "HIGH" else ("#D97706" if risk_val == "MEDIUM" else "#059669")

        summary_data = [
            [
                Paragraph(f"<b>Tender Number:</b> {tender.tender_number if tender else 'N/A'}", body_style),
                Paragraph(f"<b>Compliance Score:</b> <b><font color='#0B2545' size='12'>{score_val}</font></b>", body_style),
            ],
            [
                Paragraph(f"<b>Tender Title:</b> {tender.title if tender else 'N/A'}", body_style),
                Paragraph(f"<b>Risk Assessment:</b> <b><font color='{risk_color}' size='12'>{risk_val} RISK</font></b>", body_style),
            ],
            [
                Paragraph(f"<b>Bidder Enterprise:</b> {bidder.company_name}", body_style),
                Paragraph(f"<b>Verification Status:</b> {bidder.verification_status}", body_style),
            ],
            [
                Paragraph(f"<b>GSTIN:</b> {bidder.gstin or 'N/A'} | <b>PAN:</b> {bidder.pan or 'N/A'}", body_style),
                Paragraph(f"<b>Generated On:</b> {datetime.now(timezone.utc).strftime('%d-%b-%Y %H:%M UTC')}", body_style),
            ],
        ]
        t_summary = Table(summary_data, colWidths=[270, 270])
        t_summary.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 12))

        # Compliance Matrix Table
        story.append(Paragraph("<b>1. STATUTORY & TENDER COMPLIANCE MATRIX</b>", section_heading))
        matrix_header = ["Requirement", "Expected", "Extracted Actual", "Status", "Evidence Source"]
        matrix_rows = [matrix_header]

        for cr in compliance_results:
            st = cr.status
            if st == "PASS":
                p_st = Paragraph("PASS", badge_pass)
            elif st in ("FAIL", "MISSING", "EXPIRED"):
                p_st = Paragraph(st, badge_fail)
            else:
                p_st = Paragraph(st, badge_warn)

            doc_ev = f"{cr.evidence_page_number or 'p.1'}"
            if cr.evidence_document:
                doc_ev = f"{cr.evidence_document.original_filename} (p.{cr.evidence_page_number or '1'})"

            matrix_rows.append([
                Paragraph(f"<b>{cr.rule_name}</b>", body_style),
                Paragraph(cr.expected_value or "—", body_style),
                Paragraph(cr.actual_value or "—", body_style),
                p_st,
                Paragraph(doc_ev, body_style),
            ])

        t_matrix = Table(matrix_rows, colWidths=[95, 110, 115, 60, 160])
        t_matrix.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B2545")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_matrix)
        story.append(Spacer(1, 12))

        # AI Recommendation & Evidence Grounding
        story.append(Paragraph("<b>2. AI ADVISORY RECOMMENDATION & ROOT CAUSE ANALYSIS</b>", section_heading))
        rec_body = recommendation.recommendation_text if recommendation else "No AI recommendation generated yet."
        story.append(Paragraph(f"<b>Advisory Note:</b> {rec_body}", body_style))
        story.append(Spacer(1, 6))

        if recommendation and recommendation.key_issues:
            story.append(Paragraph("<b>Identified Non-Compliances / Deficiencies:</b>", body_style))
            for issue in recommendation.key_issues:
                story.append(Paragraph(f"• <font color='#DC2626'>{issue}</font>", body_style))
            story.append(Spacer(1, 6))

        disclaimer_text = (
            "<i>LEGAL NOTICE: AI output is strictly decision-support advisory. The final qualification or "
            "disqualification of a bidder is made solely and independently by the designated Procurement Officer.</i>"
        )
        story.append(Paragraph(disclaimer_text, ParagraphStyle("Discl", parent=body_style, fontSize=8, textColor=colors.HexColor("#64748B"))))
        story.append(Spacer(1, 10))

        # Officer Final Decision Section
        story.append(Paragraph("<b>3. PROCUREMENT OFFICER FINAL RECORD OF DECISION</b>", section_heading))
        if decision:
            dec_color = "#059669" if decision.decision == "APPROVED" else "#DC2626"
            dec_rows = [
                [Paragraph("<b>Decision Status:</b>", body_style), Paragraph(f"<b><font color='{dec_color}'>{decision.decision}</font></b>", body_style)],
                [Paragraph("<b>Deciding Officer:</b>", body_style), Paragraph(decision.officer_name, body_style)],
                [Paragraph("<b>Justification Remarks:</b>", body_style), Paragraph(decision.justification_remarks, body_style)],
                [Paragraph("<b>Timestamp:</b>", body_style), Paragraph(decision.decided_at.strftime("%d-%B-%Y %H:%M:%S UTC"), body_style)],
            ]
        else:
            dec_rows = [
                [Paragraph("<b>Decision Status:</b>", body_style), Paragraph("<b>PENDING REVIEW</b> (No final decision submitted)", badge_warn)],
                [Paragraph("<b>Authorized Signatory:</b>", body_style), Paragraph("____________________________", body_style)],
                [Paragraph("<b>Remarks:</b>", body_style), Paragraph("Awaiting competent authority sign-off.", body_style)],
            ]
        t_dec = Table(dec_rows, colWidths=[140, 400])
        t_dec.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAFAFA")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_dec)

        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes


pdf_report_service = PDFReportService()
