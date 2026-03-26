import { useEffect } from "react";

const DEFAULT_TITLE = import.meta.env.VITE_APP_NAME || "CineConnect";
const DEFAULT_DESCRIPTION =
  import.meta.env.VITE_APP_DESCRIPTION ||
  "CineConnect helps you discover trending movies, track your watchlist, and chat with the movie community in real time.";
const DEFAULT_SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:8080";

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    el!.setAttribute(key, value);
  });
}

function setCanonical(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function absoluteUrl(pathname: string): string {
  const base = DEFAULT_SITE_URL.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function usePageSeo(input: {
  title?: string;
  description?: string;
  pathname?: string;
}): void {
  const title = input.title ? `${input.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const description = input.description || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(input.pathname || window.location.pathname || "/");

  useEffect(() => {
    document.title = title;

    upsertMeta("meta[name='description']", { name: "description", content: description });
    upsertMeta("meta[property='og:title']", { property: "og:title", content: title });
    upsertMeta("meta[property='og:description']", {
      property: "og:description",
      content: description,
    });
    upsertMeta("meta[property='og:url']", { property: "og:url", content: url });
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title", content: title });
    upsertMeta("meta[name='twitter:description']", {
      name: "twitter:description",
      content: description,
    });
    setCanonical(url);
  }, [title, description, url]);
}

