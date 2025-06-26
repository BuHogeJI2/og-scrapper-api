import axios from "axios";
import cors from "cors";
import express from "express";
import { parseHTML } from "linkedom";
import { absoluteUrl, handleError, getMeta } from "./utils.js";

const app = express();
app.use(cors());

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
    Accept: "text/html, application/xhtml+xml",
  },
  maxRedirects: 5,
  validateStatus: (status) => status < 500,
});

app.get("/api/link-preview", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const response = await axiosInstance.get(url);
    const { document } = parseHTML(response.data);

    const finalUrl = response.request.res.responseUrl || url;

    // Create preview with fallbacks
    const preview = {
      title: getMeta(document, "title") || document.title,
      description:
        getMeta(document, "description") ||
        document.querySelector('meta[name="description"]')?.content,
      image: absoluteUrl(getMeta(document, "image"), finalUrl),
      url:
        getMeta(document, "url") ||
        document.querySelector('link[rel="canonical"]')?.href ||
        finalUrl,
    };

    res.json(preview);
  } catch (err) {
    handleError(err, res);
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
