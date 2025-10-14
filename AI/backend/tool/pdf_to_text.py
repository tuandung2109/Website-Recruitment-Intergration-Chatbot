import fitz  # PyMuPDF



def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text as string
        
    Raises:
        FileNotFoundError: If file doesn't exist
        Exception: For other errors
    """
    import fitz  # PyMuPDF
    import os
    
    # Validate file path
    if not file_path:
        raise ValueError("File path is empty")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    if not os.path.isfile(file_path):
        raise ValueError(f"Path is not a file: {file_path}")
    
    if not file_path.lower().endswith('.pdf'):
        raise ValueError(f"File is not a PDF: {file_path}")
    
    try:
        with fitz.open(file_path) as pdf:
            text = ""
            for page in pdf:
                text += page.get_text()
            
            if not text.strip():
                raise ValueError("PDF appears to be empty or contains no text")
                
            return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")