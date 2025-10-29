import { marked } from "marked";
import DOMPurify from "dompurify";

// Hàm parse Markdown -> HTML an toàn
export async function parseMarkdown(markdownText: string): Promise<string> {
  if (!markdownText) return "";

  // Xử lý xuống dòng
  const cleanText = markdownText.replace(/\\n/g, "\n");

  // marked() có thể trả Promise
  const rawHtml = await marked.parse(cleanText, {
    breaks: true,
    gfm: true,
  });

  // DOMPurify chỉ nhận string, ép kiểu nếu cần
  return DOMPurify.sanitize(rawHtml as string);
}
