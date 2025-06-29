export function absoluteUrl(path, base) {
  if (!path) return null;

  try {
    return new URL(path, base).href;
  } catch {
    return null;
  }
}

export function handleError(err, res) {
  console.error(err.message);

  if (err.response) {
    res.status(err.response.status).json({
      error: `Origin server responded with ${err.response.status}`,
    });
  } else if (err.code === "ECONNABORTED") {
    res.status(408).json({ error: "Request timed out" });
  } else if (err.code === "ENOTFOUND") {
    res.status(404).json({ error: "Host not found" });
  } else {
    res.status(500).json({ error: "Failed to generate preview" });
  }
}

export function getMeta(document, name) {
  const meta = document.querySelector(`meta[property="${name}"]`);

  if (meta?.content) return meta.content;
  if (meta?.getAttribute?.("content")) return meta.getAttribute("content");

  return null;
}
