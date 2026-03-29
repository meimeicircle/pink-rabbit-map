import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/submit", async (req, res) => {
    const formData = req.body;
    const submissionUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

    console.log("Received submission:", formData);

    if (submissionUrl) {
      try {
        const response = await fetch(submissionUrl, {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          return res.json({ success: true, message: "Successfully submitted to Google Sheet" });
        } else {
          const errorText = await response.text();
          console.error("Google Sheet submission failed:", errorText);
          return res.status(500).json({ success: false, message: "Google Sheet 提交失敗", details: errorText });
        }
      } catch (error) {
        console.error("Error submitting to Google Sheet:", error);
        return res.status(500).json({ success: false, message: "提交至 Google Sheet 時發生伺服器錯誤" });
      }
    }

    // Return error if URL is missing so user knows to configure it
    console.warn("GOOGLE_SHEET_WEBAPP_URL is not set. Submission not sent.");
    res.status(400).json({ 
      success: false, 
      message: "系統設定錯誤：尚未配置 GOOGLE_SHEET_WEBAPP_URL 環境變數 🐰",
      data: formData 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
