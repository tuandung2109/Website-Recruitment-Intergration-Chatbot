import fitz  # PyMuPDF

with fitz.open("C:\\Users\\myth\\Downloads\\NGUYEN THE THANH - CV.pdf") as pdf:
    text = ""
    for page in pdf:
        text += page.get_text()
print(text)
