/**
 * Chia đoạn văn dài thành các câu hoặc đoạn ngắn hơn để dễ đọc
 * @param text - Đoạn văn bản cần chia
 * @param maxLength - Độ dài tối đa của mỗi đoạn (mặc định 200 ký tự)
 * @returns Mảng các câu/đoạn đã chia
 */
export function breakIntoSentences(text: string, maxLength: number = 200): string[] {
  // Thử tách theo dấu câu (., !, ?)
  const sentenceRegex = /([^.!?]*[.!?]+)/g;
  const sentences = text.match(sentenceRegex) || [];

  if (sentences.length === 0) {
    // Nếu không có dấu câu, chia theo độ dài tối đa
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.slice(i, i + maxLength).trim());
    }
    return chunks.filter(Boolean);
  }

  // Nhóm các câu vào các đoạn văn (khoảng 150-200 ký tự mỗi đoạn)
  const result: string[] = [];
  let currentParagraph = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const newParagraph = currentParagraph
      ? currentParagraph + " " + trimmed
      : trimmed;

    if (newParagraph.length <= maxLength) {
      currentParagraph = newParagraph;
    } else {
      if (currentParagraph) {
        result.push(currentParagraph);
      }
      currentParagraph = trimmed;
    }
  }

  if (currentParagraph) {
    result.push(currentParagraph);
  }

  return result.filter(Boolean);
}

/**
 * Định dạng văn bản display - chia thành dòng và đoạn hợp lý
 * @param text - Văn bản cần định dạng
 * @returns Mảng các dòng đã được xử lý
 */
export function formatTextLines(text: string): string[] {
  const lines = text
    .split("\n")
    .flatMap((line) => {
      if (!line.trim()) return [];
      
      // Nếu là bullet point, giữ nguyên
      if (line.trim().startsWith("-")) {
        return [line.trim()];
      }
      
      // Nếu dòng dài, chia thành các câu
      if (line.trim().length > 200) {
        return breakIntoSentences(line.trim());
      }
      
      return [line.trim()];
    });

  return lines;
}
