import type { Metadata } from "next";
import type { JSX } from "react";
import React from "react";

interface SeoData {
  title: string;
  description?: string;
  url: string;
  image?: string;
  links?: { url: string }[];
}

function generateJsonLd(data: SeoData) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: data.title,
    url: data.url,
    image: data.image,
    description: data.description,
    sameAs: data.links?.map((link) => link.url),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function generateSeo(data: SeoData): {
  metadata: Metadata;
  jsonLd: JSX.Element;
} {
  const metadata: Metadata = {
    title: `${data.title} | Bioflow`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      images: data.image ? [{ url: data.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [],
    },
  };

  const jsonLd = generateJsonLd(data);

  return { metadata, jsonLd };
}
