const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'nonce-portfolio2025'; script-src-attr 'none'; style-src 'self' 'nonce-portfolio2025'; style-src-attr 'none'; font-src 'self'; img-src 'self' data: https:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; frame-src 'none'; worker-src 'self' blob:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'; upgrade-insecure-requests; block-all-mixed-content; trusted-types default; require-trusted-types-for 'script'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), clipboard-read=(), clipboard-write=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), interest-cohort=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'X-XSS-Protection': '1; mode=block',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Download-Options': 'noopen',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'off'
};

const ASSET_CACHE = 'public, max-age=31536000, immutable';
const HTML_CACHE = 'no-store, no-cache, must-revalidate, private';
const MANIFEST_CACHE = 'public, max-age=86400';

function applyCacheDirectives(headers, pathname) {
  if (/^\/(?:css|js|img|fonts)\//.test(pathname) || /^\/icon\./.test(pathname)) {
    headers.set('Cache-Control', ASSET_CACHE);
    headers.delete('Pragma');
    headers.delete('Expires');
    return;
  }

  if (pathname === '/site.webmanifest') {
    headers.set('Content-Type', 'application/manifest+json');
    headers.set('Cache-Control', MANIFEST_CACHE);
    headers.delete('Pragma');
    headers.delete('Expires');
    return;
  }

  headers.set('Cache-Control', HTML_CACHE);
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
}

async function fetchFromOrigin(request, originHost) {
  const originUrl = new URL(request.url);
  originUrl.hostname = originHost ?? originUrl.hostname;
  originUrl.protocol = 'https:';

  const upstreamRequest = new Request(originUrl.toString(), request);
  return fetch(upstreamRequest, { redirect: 'manual' });
}

export default {
  async fetch(request, env) {
    const originHost = env.ORIGIN_HOST ?? 'miyuruamarasiri.github.io';
    const upstreamResponse = await fetchFromOrigin(request, originHost);
    const headers = new Headers(upstreamResponse.headers);

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }

    applyCacheDirectives(headers, new URL(request.url).pathname);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers
    });
  }
};
