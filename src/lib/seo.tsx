import type { Metadata } from "next";
import type { JSX } from "react";
import React from "react";

interface SeoData {
  title: string;
  description?: string;
  url: string;
  image?: string;
  links?: { url: string }[];
  handle: string;
}

function generateJsonLd(data: SeoData) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.url,
    },
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image,
    inLanguage: "en-US",
    author: {
      "@type": "Organization",
      name: "Bioflow",
      url: "https://bioflow.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Bioflow",
      logo: {
        "@type": "ImageObject",
        url: "https://bioflow.com/logo.png",
        width: 600,
        height: 60,
      },
    },
    datePublished: "2023-01-01T00:00:00Z",
    dateModified: "2023-01-01T00:00:00Z",
    isPartOf: {
      "@type": "WebPage",
      "@id": "https://bioflow.com",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": "https://bioflow.com",
            name: "Bioflow",
            url: "https://bioflow.com",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": data.url,
            name: data.title,
            url: data.url,
          },
        },
      ],
    },
    articleSection: "Content",
    wordCount: 1000,
    commentCount: 10,
    ratingCount: 50,
    reviewCount: 10,
    discussionUrl: "https://bioflow.com/discussion",
    mentions: [
      {
        "@type": "Mention",
        url: "https://twitter.com/bioflow",
      },
    ],
    isAccessibleForFree: true,
    potentialAction: [
      {
        "@type": "ReadAction",
        target: [data.url],
      },
      {
        "@type": "ListenAction",
        target: [data.url],
      },
      {
        "@type": "WatchAction",
        target: [data.url],
      },
    ],
    mainEntity: {
      "@type": "Article",
      headline: data.title,
      description: data.description,
      url: data.url,
      image: data.image,
      inLanguage: "en-US",
      author: {
        "@type": "Person",
        name: "Bioflow",
      },
      publisher: {
        "@type": "Organization",
        name: "Bioflow",
        logo: {
          "@type": "ImageObject",
          url: "https://bioflow.com/logo.png",
          width: 600,
          height: 60,
        },
      },
      datePublished: "2023-01-01T00:00:00Z",
      dateModified: "2023-01-01T00:00:00Z",
      isPartOf: {
        "@type": "WebPage",
        "@id": "https://bioflow.com",
      },
      articleSection: "Content",
      wordCount: 1000,
      commentCount: 10,
      ratingCount: 50,
      reviewCount: 10,
      discussionUrl: "https://bioflow.com/discussion",
      mentions: [
        {
          "@type": "Mention",
          url: "https://twitter.com/bioflow",
        },
      ],
      isAccessibleForFree: true,
      potentialAction: [
        {
          "@type": "ReadAction",
          target: [data.url],
        },
        {
          "@type": "ListenAction",
          target: [data.url],
        },
        {
          "@type": "WatchAction",
          target: [data.url],
        },
      ],
    },
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImageUrl = `${siteUrl}/og/${data.handle}`;

  const metadata: Metadata = {
    title: `${data.title} | Bioflow`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [ogImageUrl],
    },
  };

  const jsonLd = generateJsonLd(data);

  return { metadata, jsonLd };
}
