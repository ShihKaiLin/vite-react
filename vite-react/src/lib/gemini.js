/**
 * Gemini AI 文案生成
 * ⚠️ 前端只能呼叫 Cloud Function，不可直接放 API Key
 */

export async function generateShareCopy(properties) {
  const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;

  if (!functionsBaseUrl) {
    throw new Error("VITE_FUNCTIONS_BASE_URL 未設定");
  }

  const endpoint = `${functionsBaseUrl}/generateShareCopy`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  if (!response.ok) {
    throw new Error(`Cloud Function 呼叫失敗: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * AI 自動辨識物件資訊
 * @param {File[]} files - 圖片或 PDF 檔案陣列
 * @returns {Promise<Object>} - 提取的物件資訊
 */
export async function extractPropertyInfo(files) {
  const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;

  if (!functionsBaseUrl) {
    throw new Error("VITE_FUNCTIONS_BASE_URL 未設定");
  }

  const endpoint = `${functionsBaseUrl}/extractPropertyInfo`;
  
  const formData = new FormData();
  
  for (const file of files) {
    formData.append('files', file);
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'AI 辨識失敗');
  }
  
  return await response.json();
}
