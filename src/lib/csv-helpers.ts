export function parseCsv<T extends object>(csvText: string): T[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) {
    // Return empty array if only header or empty file
    return [];
  }

  // More robust splitting to handle quoted commas
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, '')); // remove leading/trailing quotes
  };
  
  const header = splitLine(lines[0]);
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines

    const values = splitLine(line);
    const entry: Record<string, any> = {};
    
    header.forEach((key, i) => {
      const value = values[i] ?? '';
      const numValue = Number(value.replace(/[^0-9.-]+/g,""));
      // Attempt to convert to number if it looks like one and is not just an ID
      if (!isNaN(numValue) && value.trim() !== '' && !key.toLowerCase().includes('id')) {
         entry[key] = numValue;
      } else {
         entry[key] = value;
      }
    });
    return entry as T;
  }).filter(Boolean) as T[];
}
