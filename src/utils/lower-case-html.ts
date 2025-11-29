export const stripHtml = (html: string) => {
    if (!html) return "";
    // Cách 1: Dùng DOMParser (Chính xác nhất, convert cả &nbsp; thành khoảng trắng)
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
    
    // Cách 2: Dùng Regex (Nhanh, gọn nhẹ nếu ko cần chính xác tuyệt đối ký tự đặc biệt)
    // return html.replace(/<[^>]*>?/gm, '');
};
