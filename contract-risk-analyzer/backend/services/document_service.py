import fitz  # PyMuPDF
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file in memory.
    """
    try:
        # Open the PDF from bytes
        doc = fitz.open("pdf", pdf_bytes)
        
        full_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            full_text += page.get_text("text") + "\n\n"
            
        return full_text.strip()
    except Exception as e:
        raise Exception(f"Failed to read PDF file: {str(e)}")

def split_into_paragraphs(text: str) -> list[str]:
    """
    Splits the full contract text into rough paragraphs.
    Our Hugging Face model only accepts 512 tokens at a time, 
    so analyzing it paragraph-by-paragraph is required.
    """
    # Split by double newline which usually indicates a new paragraph in PDFs
    raw_chunks = text.split('\n\n')
    
    clean_chunks = []
    for chunk in raw_chunks:
        # Clean up the text
        cleaned = chunk.replace('\n', ' ').strip()
        
        # Only keep chunks that are long enough to actually be a clause (skip headers/page numbers)
        if len(cleaned) > 50:
            clean_chunks.append(cleaned)
            
    return clean_chunks
