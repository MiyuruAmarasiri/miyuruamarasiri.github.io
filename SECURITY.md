# Security Implementation Guide

This document outlines the comprehensive security headers implementation for the Miyuru Amarasiri Portfolio website.

## 🔒 Security Headers Overview

The website implements enterprise-grade security headers to protect against various web vulnerabilities including XSS, clickjacking, MIME sniffing, and data injection attacks.

### Implemented Security Headers

#### 1. Content Security Policy (CSP)
**Purpose**: Prevents XSS and data injection attacks by controlling resource loading.

**Configuration**:
```
default-src 'self';
script-src 'self';
script-src-attr 'none';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
style-src-attr 'none';
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
media-src 'self';
object-src 'none';
child-src 'none';
frame-src 'none';
worker-src 'self' blob:;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
manifest-src 'self';
upgrade-insecure-requests;
block-all-mixed-content;
require-trusted-types-for 'script'
```

**Key Features**:
- Blocks all external scripts except from same origin and bans inline event handlers
- Allows Google Fonts for typography while forbidding other third-party styles
- Locks down dynamically injected styles to the bundled runtime only
- Prevents framing (clickjacking protection)
- Forces HTTPS upgrades and Mixed Content blocking
- Requires Trusted Types for script sinks, mitigating DOM XSS injection

#### 2. X-Frame-Options
**Purpose**: Prevents clickjacking attacks by controlling iframe embedding.

**Configuration**: `DENY`
- Completely prevents the page from being embedded in frames

#### 3. X-Content-Type-Options
**Purpose**: Prevents MIME sniffing attacks.

**Configuration**: `nosniff`
- Forces browsers to respect declared content types

#### 4. Referrer-Policy
**Purpose**: Controls referrer information leakage.

**Configuration**: `strict-origin-when-cross-origin`
- Sends full referrer for same-origin requests
- Sends only origin for cross-origin HTTPS requests
- Sends no referrer for HTTPS to HTTP requests

#### 5. Permissions-Policy
**Purpose**: Controls browser feature access to prevent unauthorized usage.

**Configuration**: Disables all sensitive features:
- `accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), clipboard-read=(), clipboard-write=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), interest-cohort=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()`

#### 6. Cross-Origin Policies
**Cross-Origin-Embedder-Policy**: `require-corp`
**Cross-Origin-Opener-Policy**: `same-origin`
**Cross-Origin-Resource-Policy**: `same-origin`
**Origin-Agent-Cluster**: `?1`

These headers provide additional isolation and prevent cross-origin attacks.

#### 7. Additional Security Headers
- **X-XSS-Protection**: `1; mode=block` (Legacy XSS protection)
- **X-Permitted-Cross-Domain-Policies**: `none` (Blocks Flash/PDF policies)
- **X-Download-Options**: `noopen` (Prevents IE from opening downloads)
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload` (2-year HSTS)
- **X-DNS-Prefetch-Control**: `off` (Prevents DNS prefetching data exposure)

## 🚀 Deployment Configurations

### Multiple Platform Support
The security headers are configured for multiple hosting platforms:

1. **_headers** - Universal format (Netlify, Vercel, Cloudflare Pages)
2. **netlify.toml** - Netlify-specific configuration
3. **vercel.json** - Vercel-specific configuration
4. **HTML Meta Tags** - Fallback for static hosting
5. **Webpack Dev Server** - Development environment headers

### GitHub Pages Deployment
For GitHub Pages deployment, the headers are implemented via HTML meta tags since GitHub Pages doesn't support custom HTTP headers.

## 🧪 Testing and Validation

### Security Headers Test Tool
A custom Node.js testing tool is included: `security-headers-test.js`

**Usage**:
```bash
# Test local development server
npm run security:test:local

# Test production website
npm run security:test:prod

# Test any URL
npm run security:test https://example.com
```

**Features**:
- Validates all security headers
- Provides detailed analysis and scoring
- Identifies missing or misconfigured headers
- Generates security grade (A+ to F)

### Manual Testing
You can also test headers manually using:

1. **Browser DevTools**: Network tab → Response Headers
2. **Online Tools**: 
   - [Security Headers](https://securityheaders.com/)
   - [Mozilla Observatory](https://observatory.mozilla.org/)
3. **Command Line**: `curl -I https://your-domain.com`

## 🔧 Development vs Production

### Development Environment
- Includes `'unsafe-eval'` in CSP for webpack hot reloading
- Allows WebSocket connections (`ws:`, `wss:`) for hot module replacement
- Less restrictive for development workflow

### Production Environment
- Stricter CSP without `'unsafe-eval'`
- HSTS header for HTTPS enforcement
- Complete cross-origin isolation
- Optimized caching headers for static assets

## 📋 Security Checklist

- [x] Content Security Policy implemented
- [x] Clickjacking protection (X-Frame-Options + CSP frame-ancestors)
- [x] MIME sniffing protection
- [x] Referrer policy configured
- [x] Permissions policy restricts all sensitive features
- [x] Cross-origin policies implemented
- [x] HSTS configured with 2-year max-age
- [x] XSS protection enabled
- [x] Cross-domain policies blocked
- [x] Download options secured
- [x] Automated testing tool created
- [x] Multiple deployment platform support
- [x] Development environment configured

## 🚨 Security Considerations

### Regular Updates
- Review and update CSP directives when adding new external resources
- Monitor security header best practices and update accordingly
- Test headers after any deployment configuration changes

### Performance Impact
- Security headers have minimal performance impact
- CSP may block resources if misconfigured - test thoroughly
- HSTS preload requires careful consideration (difficult to reverse)

### Browser Compatibility
- All implemented headers are supported by modern browsers
- Fallback meta tags ensure compatibility with older browsers
- Progressive enhancement approach maintains functionality

## 📞 Support and Maintenance

For security-related issues or questions:
1. Review this documentation
2. Run the security test tool
3. Check browser console for CSP violations
4. Validate headers using online tools

Remember: Security is an ongoing process. Regularly review and update these configurations as the web platform evolves.