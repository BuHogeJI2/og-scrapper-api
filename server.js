import axios from "axios";
import cors from "cors";
import express from "express";
import { parseHTML } from "linkedom";
import { absoluteUrl, handleError, getMeta } from "./utils.js";

const app = express();
app.use(cors());

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
  },
  maxRedirects: 10,
  decompress: true,
});

app.get("/api/link-preview", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    // todo: investigate
    // for some reason response from banch of site has empty content for meta tags
    // ex. <meta property="og:image" content="">
    const response = await axiosInstance.get(url, {
      maxRedirects: 10,
      beforeRedirect(options) {
        finalUrl = options.href;
      },
    });

    const { document } = parseHTML(response.data);
    const finalUrl = response.request.res.responseUrl || url;

    const getBestImage = () => {
      const candidates = [
        getMeta(document, "og:image"),
        getMeta(document, "twitter:image"),
        document.querySelector('meta[property="og:image:secure_url"]')?.content,
        document.querySelector('meta[name="twitter:image:src"]')?.content,

        [...document.querySelectorAll("img")]
          .filter((img) => img.naturalWidth > 100 && img.naturalHeight > 100)
          .sort(
            (a, b) =>
              b.naturalWidth * b.naturalHeight -
              a.naturalWidth * a.naturalHeight,
          )[0]?.src,
      ].filter(Boolean);

      return absoluteUrl(candidates[0], finalUrl);
    };

    const preview = {
      title:
        getMeta(document, "og:title") ||
        getMeta(document, "twitter:title") ||
        document.title,
      description:
        getMeta(document, "og:description") ||
        getMeta(document, "twitter:description") ||
        document.querySelector('meta[name="description"]')?.content,
      image: getBestImage(),
      url:
        getMeta(document, "og:url") ||
        document.querySelector('link[rel="canonical"]')?.href ||
        finalUrl,
      siteName: getMeta(document, "og:site_name"),
    };

    res.json(preview);
  } catch (err) {
    handleError(err, res);
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
