/**
 * Cloud Function: extractPropertyInfo
 * 
 * 功能：從圖片或 PDF 中提取房地產物件資訊
 * 使用：Gemini Vision API
 */

const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Busboy = require('busboy');

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 系統 Prompt
const SYSTEM_PROMPT = `你是一位專業的台灣房地產資訊提取助手。
請從提供的圖片或 PDF 中提取房地產物件資訊，並以 JSON 格式輸出。

提取規則：
1. 地址必須包含「台中市」+ 行政區 + 路名
2. 行政區必須是台中市的有效行政區（中區、東區、西區、南區、北區、西屯區、南屯區、北屯區、豐原區、大里區、太平區、清水區、沙鹿區、大甲區、東勢區、梧棲區、烏日區、神岡區、大肚區、大雅區、后里區、霧峰區、潭子區、龍井區、外埔區、和平區、石岡區、大安區、新社區）
3. 價格單位為「萬元」
4. 坪數單位為「坪」
5. 物件類型限定為：大樓、公寓、透天、華廈、店面、辦公、廠房、土地
6. 建材限定為：RC、SRC、SC、加強磚造、木造、鋼骨造
7. 如果無法確定某個欄位，請設為 null
8. expertReview 請用繁體中文描述物件特色、優勢、周邊環境
9. 請提供 confidence 信心分數（0-1），根據圖片清晰度和資訊完整度評估

輸出格式（嚴格 JSON，不要包含任何其他文字）：
{
  "title": "案名或標題",
  "address": "完整地址",
  "district": "行政區",
  "price": 總價(數字),
  "area": 建坪(數字),
  "buildingArea": 主建物(數字),
  "publicArea": 公設(數字),
  "rooms": 房間數(數字),
  "halls": 廳數(數字),
  "bathrooms": 衛浴數(數字),
  "type": "物件類型",
  "floor": 樓層(數字),
  "totalFloors": 總樓層(數字),
  "age": 屋齡(數字),
  "managementFee": 管理費(數字),
  "constructionMaterial": "建材",
  "expertReview": "物件特色描述",
  "confidence": 信心分數(0-1)
}

範例：
如果圖片顯示「台中市西區館前路100號 3房2廳2衛 85坪 8500萬 15F/25F 屋齡5年」
則輸出：
{
  "title": "館前路優質住宅",
  "address": "台中市西區館前路100號",
  "district": "西區",
  "price": 8500,
  "area": 85,
  "buildingArea": 75,
  "publicArea": 10,
  "rooms": 3,
  "halls": 2,
  "bathrooms": 2,
  "type": "大樓",
  "floor": 15,
  "totalFloors": 25,
  "age": 5,
  "managementFee": null,
  "constructionMaterial": "RC",
  "expertReview": "位於西區精華地段，生活機能完善，交通便利。",
  "confidence": 0.9
}`;

/**
 * 解析 multipart/form-data
 */
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const files = [];
    
    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        files.push({
          fieldname,
          filename,
          mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });
    
    busboy.on('finish', () => {
      resolve(files);
    });
    
    busboy.on('error', reject);
    
    req.pipe(busboy);
  });
}

/**
 * 將 Buffer 轉換為 Gemini 可接受的格式
 */
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * 使用 Gemini Vision API 提取資訊
 */
async function extractWithGemini(files) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 準備圖片/PDF 資料
    const imageParts = files.map(file => 
      bufferToGenerativePart(file.buffer, file.mimeType)
    );
    
    // 組合 prompt
    const prompt = SYSTEM_PROMPT + '\n\n請分析以上圖片並提取房地產資訊。';
    
    // 呼叫 API
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini Raw Response:', text);
    
    // 解析 JSON
    // 移除可能的 markdown 代碼塊標記
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const data = JSON.parse(jsonText);
    
    // 驗證必要欄位
    if (!data.title && !data.address && !data.price) {
      throw new Error('無法提取有效資訊');
    }
    
    return {
      success: true,
      data,
    };
    
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error(`AI 辨識失敗: ${error.message}`);
  }
}

/**
 * 驗證檔案類型
 */
function validateFiles(files) {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  
  for (const file of files) {
    if (!allowedTypes.includes(file.mimeType)) {
      throw new Error(`不支援的檔案類型: ${file.mimeType}`);
    }
    
    // 檔案大小限制 10MB
    if (file.buffer.length > 10 * 1024 * 1024) {
      throw new Error(`檔案過大: ${file.filename}`);
    }
  }
  
  // 總檔案數限制
  if (files.length > 5) {
    throw new Error('最多只能上傳 5 個檔案');
  }
  
  return true;
}

/**
 * 主函數
 */
exports.extractPropertyInfo = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
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
      // 解析上傳的檔案
      const files = await parseMultipartForm(req);
      
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: '未上傳任何檔案' });
        return;
      }
      
      console.log(`Received ${files.length} file(s)`);
      
      // 驗證檔案
      validateFiles(files);
      
      // 使用 Gemini 提取資訊
      const result = await extractWithGemini(files);
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'AI 辨識失敗',
      });
    }
  });
