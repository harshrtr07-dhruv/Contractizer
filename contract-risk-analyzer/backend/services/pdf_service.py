import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def extract_pdf_data(pdf_bytes: bytes) -> dict:
    """
    Extracts text per page from PDF bytes using PyMuPDF (fitz).
    Returns dict containing full_text, pages list, and page_count.
    Raises ValueError if PDF appears scanned (under 100 total characters).
    """
    try:
        doc = fitz.open("pdf", pdf_bytes)
        pages_data = []
        full_text_list = []
        
        for page_idx in range(len(doc)):
            page = doc.load_page(page_idx)
            page_text = page.get_text("text").strip()
            page_num = page_idx + 1
            
            if page_text:
                pages_data.append({
                    "page_number": page_num,
                    "text": page_text
                })
                full_text_list.append(f"--- Page {page_num} ---\n{page_text}")
                
        full_text = "\n\n".join(full_text_list).strip()
        
        if len(full_text) < 100:
            raise ValueError("Extracted text is under 100 characters. The PDF may be scanned/image-based and requires OCR.")
            
        return {
            "full_text": full_text,
            "pages": pages_data,
            "page_count": len(doc)
        }
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        logger.error(f"PyMuPDF PDF extraction failed: {str(e)}")
        raise Exception(f"Failed to parse PDF document: {str(e)}")
