import { useEffect } from "react";

const upsert = (key, content, attribute = "name") => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const SITE = "NexPress";

/** Per-route title/description so each tool gets its own search preview. */
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = `${title} | ${SITE}`;
      upsert("og:title", document.title, "property");
      upsert("twitter:title", document.title);
    }
    if (description) {
      upsert("description", description);
      upsert("og:description", description, "property");
      upsert("twitter:description", description);
    }
    upsert("og:type", "website", "property");
    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
