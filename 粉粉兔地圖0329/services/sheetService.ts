
import { RAW_EXCEL_DATA } from '../constants';
import { EstateProject, RabbitVerdict } from '../types';

// Placeholder Images (Cycling these for the real data since we don't have real photos)
const HOUSING_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-2495db98dada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export const fetchProjects = async (): Promise<EstateProject[]> => {
  return new Promise((resolve) => {
    // 模擬載入時間，讓使用者感覺到「粉粉兔努力跑腿中」
    setTimeout(() => {
      const projects = parsePasteData(RAW_EXCEL_DATA);
      const validProjects = projects.filter(p => p.showOnMap);
      resolve(validProjects);
    }, 800); 
  });
};

/**
 * 標準化建材標籤
 */
export const normalizeMaterialTags = (str: string): string => {
  if (!str) return '';
  const rawSegments = str.split(/[|｜]/);
  const normalizedSegments = rawSegments.map(segment => {
    const cleanSegment = segment.trim();
    if (!cleanSegment) return null;
    const emojiRegex = /([\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+)/gu;
    const emojis = cleanSegment.match(emojiRegex);
    if (emojis) {
      const emojiBlock = emojis.join('');
      const text = cleanSegment.replace(emojiRegex, '').trim();
      return text ? `${emojiBlock} ${text}` : emojiBlock;
    }
    return cleanSegment;
  }).filter(Boolean);
  return normalizedSegments.join('|');
};

/**
 * 解析貼上的 TSV (Tab Separated Values) 或 CSV
 * 使用 State Machine 模式來正確處理 Excel 複製過來帶有雙引號和換行的內容
 */
export const parsePasteData = (text: string): EstateProject[] => {
  if (!text) return [];

  // 1. 偵測分隔符號 (Excel 複製通常是 Tab，但也支援 CSV)
  const isTab = (text.slice(0, 200).match(/\t/g) || []).length > 0;
  const delimiter = isTab ? '\t' : ',';

  // 2. State Machine Parser
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote ("") -> transform to single quote
          currentCell += '"';
          i++; 
        } else {
          // End of quote
          inQuote = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === delimiter) {
        // End of cell
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\r' || char === '\n') {
        // End of row
        // Handle Windows CRLF (\r\n) by skipping \n if we hit \r
        if (char === '\r' && nextChar === '\n') {
            i++;
        }
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push the last cell/row if exists
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  // 3. 過濾空行
  const cleanRows = rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
  if (cleanRows.length < 2) return [];

  // 4. 解析標題列
  const headers = cleanRows[0].map(h => h.trim());
  
  const findIndex = (keywords: string[]) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const idx = {
    // 必填基本欄位
    name: findIndex(['名稱', '建案名稱', 'Name', '建案']),
    lat: findIndex(['緯度', 'Lat']),
    lng: findIndex(['經度', 'Lng']),
    region: findIndex(['區域', 'Region']),
    
    // 顯示資訊
    mainSquareFootage: findIndex(['坪數', '坪數規劃', 'Square']),
    // 修正: Excel 中的「主要訴求」是大段文字，應對應到 reason
    reason: findIndex(['主要訴求', '訴求', '理由', 'Reason']), 
    // Excel 中沒有特別提供短標籤，我們之後自動抓取
    sellingPoint: findIndex(['短評', '賣點', 'Tag']), 
    
    // 建材 Emoji 標籤
    materialEmojiTags: findIndex(['建材 Emoji', '建材Emoji']), 
    
    // 詳細規格
    baseArea: findIndex(['基地', '基地面積', 'Base']), 
    totalUnits: findIndex(['戶數', '住家戶數', 'Units']), 
    publicRatio: findIndex(['公設', '公設比', 'Public']), 
    managementFee: findIndex(['管理費', 'Management']),
    floorHeightMeters: findIndex(['樓高（米）', '樓高(米)', '樓高(m)']), // 新增欄位
    
    // 評分與價格
    score: findIndex(['評分', '粉粉兔評分器', 'Score', '分數']), 
    price: findIndex(['價格', 'Price', '價']),
    
    // 新增標籤欄位
    trafficTags: findIndex(['交通標籤', 'Traffic']),
    materialTextTags: findIndex(['建材標籤']), // 注意不要跟 Emoji 混淆，parser 會找包含字串，這裡假設 Emoji 標籤已經被上面的 materialEmojiTags 抓走(如果順序正確) 或者需要更精確
    viewTags: findIndex(['景觀標籤', 'View']),
    waterproofTags: findIndex(['防水標籤', 'Waterproof']),
    floorHeightTags: findIndex(['樓高標籤', 'Height']),

    // 其他欄位
    address: findIndex(['地址', 'Address']),
    developer: findIndex(['建商', 'Developer']),
    verdict: findIndex(['評論', '評價', '推薦', 'Verdict']),
    
    kitchenSpecs: findIndex(['廚具', 'Kitchen']),
    bathroomSpecs: findIndex(['衛浴', 'Bath']),
    windowSpecs: findIndex(['窗戶', 'Window']),
    userName: findIndex(['網友名稱', 'Submitter']),
    userEmoji: findIndex(['網友 Emoji']),
  };

  // 修正建材標籤抓取邏輯 (避免混淆)
  // 如果 '建材標籤' 的 index 跟 '建材 Emoji' 一樣，可能是抓錯了，需要重新找
  if (idx.materialTextTags === idx.materialEmojiTags && idx.materialEmojiTags !== -1) {
     // 嘗試精確尋找 '建材標籤'
     idx.materialTextTags = headers.findIndex(h => h === '建材標籤');
  }

  const projects: EstateProject[] = [];

  // 5. 轉換資料列
  for (let i = 1; i < cleanRows.length; i++) {
    const cols = cleanRows[i];
    if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

    // Name is required
    const name = idx.name !== -1 ? cols[idx.name] : '';
    if (!name) continue;

    const getVal = (index: number) => index !== -1 && cols[index] ? cols[index].trim() : '';

    const lat = idx.lat !== -1 ? parseFloat(cols[idx.lat]) : 0;
    const lng = idx.lng !== -1 ? parseFloat(cols[idx.lng]) : 0;

    // Parse Score
    let score: number | undefined = undefined;
    if (idx.score !== -1) {
       const rawScore = cols[idx.score];
       const parsedScore = parseFloat(rawScore?.replace(/[^\d.]/g, ''));
       if (!isNaN(parsedScore)) {
          score = parsedScore;
       }
    }

    // Determine Verdict
    let rawVerdict = '';
    if (score !== undefined) {
       if (score >= 90) rawVerdict = RabbitVerdict.RECOMMEND; 
       else if (score >= 81) rawVerdict = RabbitVerdict.NEUTRAL; 
       else rawVerdict = RabbitVerdict.NOT_RECOMMENDED;
    } else if (idx.verdict !== -1) {
       const v = getVal(idx.verdict);
       if (['Y', '是', 'TRUE', 'OK', '推', '讚'].includes(v.toUpperCase())) rawVerdict = RabbitVerdict.RECOMMEND;
       else if (['N', '否', 'FALSE', 'NO', '不推'].includes(v.toUpperCase())) rawVerdict = RabbitVerdict.NOT_RECOMMENDED;
       else rawVerdict = v || RabbitVerdict.NEUTRAL;
    } else {
       rawVerdict = RabbitVerdict.NEUTRAL;
    }

    const rawMaterials = getVal(idx.materialEmojiTags); // Emoji version
    const normalizedMaterials = normalizeMaterialTags(rawMaterials);
    
    // 處理 reason 和 sellingPoint (短標籤)
    const reasonText = getVal(idx.reason); // "1. xxx \n 2. xxx"
    let tagText = getVal(idx.sellingPoint);

    // 如果沒有短標籤，直接使用完整 reasonText，不截斷
    if (!tagText && reasonText) {
        tagText = reasonText;
    }

    const project: EstateProject = {
      id: `imported-${Date.now()}-${i}`,
      name: name,
      lat: lat || 25.0330, 
      lng: lng || 121.5654, 
      region: getVal(idx.region) || '未分類',
      address: getVal(idx.address),
      developer: getVal(idx.developer) || '未提供建商',
      priceInfo: getVal(idx.price) || '洽現場',
      verdict: rawVerdict,
      
      reason: reasonText, // 詳細說明
      sellingPoint: tagText, // 列表上的訴求 (完整)
      
      materialTags: normalizedMaterials, // Emoji Tags
      
      // Pro Fields
      totalUnits: getVal(idx.totalUnits), 
      baseArea: getVal(idx.baseArea),
      publicRatio: getVal(idx.publicRatio),
      managementFee: getVal(idx.managementFee), 
      floorHeightMeters: getVal(idx.floorHeightMeters), // New Field
      
      // New Tags
      trafficTags: getVal(idx.trafficTags),
      featureMaterialTags: getVal(idx.materialTextTags),
      viewTags: getVal(idx.viewTags),
      waterproofTags: getVal(idx.waterproofTags),
      featureFloorTags: getVal(idx.floorHeightTags),

      kitchenSpecs: getVal(idx.kitchenSpecs),
      bathroomSpecs: getVal(idx.bathroomSpecs),
      score: score,
      mainSquareFootage: getVal(idx.mainSquareFootage),
      
      shortComment: '',
      showOnMap: true,
      floorHeight: getVal(idx.floorHeightTags), // Can reuse this column or older one if exists
      windowSpecs: getVal(idx.windowSpecs),
      images: [HOUSING_IMAGES[i % HOUSING_IMAGES.length]], // Assign a random placeholder image
      submitter: getVal(idx.userName) ? {
        name: getVal(idx.userName),
        emoji: getVal(idx.userEmoji) || '🐰'
      } : undefined
    };

    projects.push(project);
  }

  return projects;
};
