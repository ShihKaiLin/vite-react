/**
 * Cloud Function: generateShareCopy
 * 
 * 功能：生成 FB/LINE/Threads 三平台文案
 * 使用：Gemini API
 */

const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 生成文案 Prompt
 */
function createPrompt(properties) {
  const propertyList = properties.map((p, i) => `
物件 ${i + 1}:
- 標題: ${p.title}
- 地址: ${p.address}
- 行政區: ${p.district}
- 價格: ${p.price} 萬
- 坪數: ${p.area} 坪
- 格局: ${p.rooms}房${p.halls}廳${p.bathrooms}衛
- 類型: ${p.type}
- 特色: ${p.expertReview || '無'}
  `).join('\n');

  return `你是一位專業的台中房地產行銷專家。請根據以下物件資訊，生成三種不同平台的行銷文案。

${propertyList}

請生成以下三種文案（嚴格 JSON 格式）：

1. **FB 專業版** (fb):
   - 標題吸睛，使用數字與優勢
   - 列點說明物件優勢（如：近74號快速道路、高樓層、雙車位）
   - 與實價登錄比較（如：比行情便宜 5%）
   - 明確 Call-to-Action（如：立即預約看屋）
   - 字數：150-200 字

2. **LINE VOOM 視覺版** (line):
   - 短文案，使用 Emoji 突出重點
   - 強調標籤（如：🏠首購首選、✨即可入住）
   - 價格與坪數醒目
   - 字數：80-120 字

3. **Threads 互動版** (threads):
   - 以「房地產專家」口吻分享見解
   - 引發討論與共鳴
   - 不過度廣告
   - 提供市場觀點或購屋建議
   - 字數：100-150 字

輸出格式（嚴格 JSON）：
{
  "fb": "FB 文案內容",
  "line": "LINE 文案內容",
  "threads": "Threads 文案內容"
}`;
}

/**
 * 主函數
 */
exports.generateShareCopy = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: '僅支援 POST 請求' });
      return;
    }
    
    try {
      const { properties } = req.body;
      
      if (!properties || !Array.isArray(properties) || properties.length === 0) {
        res.status(400).json({ success: false, error: '請提供物件資料' });
        return;
      }
      
      console.log(`Generating copy for ${properties.length} properties`);
      
      // 使用 Gemini 生成文案
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = createPrompt(properties);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      console.log('Gemini Raw Response:', text);
      
      // 解析 JSON
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      const data = JSON.parse(text);
      
      res.status(200).json({
        success: true,
        ...data,
      });
      
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'AI 生成失敗',
      });
    }
  });
