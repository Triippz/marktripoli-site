import { useEffect } from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  noIndex?: boolean;
};

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOg(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SEO({ title, description, url, image, noIndex }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('title', title);
      setOg('og:title', title);
      setMeta('twitter:title', title);
    }
    if (description) {
      setMeta('description', description);
      setOg('og:description', description);
      setMeta('twitter:description', description);
    }
    if (url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
      setOg('og:url', url);
    }
    if (image) {
      setOg('og:image', image);
      setMeta('twitter:image', image);
    }
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow');
    }
  }, [title, description, url, image, noIndex]);
  return null;
}

