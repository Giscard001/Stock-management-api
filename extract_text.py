
import re
import sys

def extract_text(xml_file):
    with open(xml_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all xml tags
    text = re.sub(r'<[^>]+>', ' ', content)
    # broken lines restoration ? No just keep lines
    lines = text.splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    return '\n'.join(cleaned_lines)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(extract_text(sys.argv[1]))
