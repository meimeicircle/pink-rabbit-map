export async function onRequestPost(context: any) {
  try {
    // 取得前端傳來的 JSON 資料
    const requestData = await context.request.json();
    
    // 從 Cloudflare Pages 的環境變數中取得 Google Sheet Web App URL
    const googleSheetUrl = context.env.GOOGLE_SHEET_WEBAPP_URL;

    if (!googleSheetUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "系統設定錯誤：尚未配置 GOOGLE_SHEET_WEBAPP_URL 環境變數 🐰" 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 轉發請求到 Google Apps Script
    // 注意：Google Apps Script 接收 POST 時，如果 Content-Type 是 application/json 會觸發 CORS Preflight (OPTIONS)
    // 但 Apps Script 不支援 OPTIONS。所以我們在後端轉發，避開瀏覽器的 CORS 限制。
    const response = await fetch(googleSheetUrl, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Google Apps Script 通常會回傳 302 Redirect，fetch 預設會 follow redirect
    // 最終拿到 200 OK 和 JSON 回應
    const resultText = await response.text();
    
    return new Response(resultText, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 允許前端跨域請求 (如果前端跟 API 在同一個網域，其實不需要，但加上比較保險)
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "伺服器發生錯誤，請稍後再試 🐰",
      error: error?.toString() || "Unknown error"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
