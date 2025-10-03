/**
 * Security Headers Validation Tool
 * Tests and validates security headers implementation
 * Run with: node security-headers-test.js [URL]
 */
/* eslint-disable */

const https = require('https');
const http = require('http');
const url = require('url');

// Required security headers with their expected values/patterns
const REQUIRED_HEADERS = {
  'content-security-policy': {
    required: true,
    description: 'Content Security Policy - Prevents XSS and data injection attacks',
    validate: (value) => {
      const requiredDirectives = [
        'default-src',
        'script-src',
        'script-src-attr',
        'style-src',
        'style-src-attr',
        'img-src',
        'connect-src',
        'font-src',
        'object-src',
        'frame-ancestors',
        'form-action',
        'base-uri',
        'worker-src',
        'manifest-src',
        'upgrade-insecure-requests',
        'block-all-mixed-content'
      ];
      return requiredDirectives.every(directive => 
        value.toLowerCase().includes(directive)
      );
    }
  },
  'x-frame-options': {
    required: true,
    description: 'X-Frame-Options - Prevents clickjacking attacks',
    validate: (value) => ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase())
  },
  'x-content-type-options': {
    required: true,
    description: 'X-Content-Type-Options - Prevents MIME sniffing attacks',
    validate: (value) => value.toLowerCase() === 'nosniff'
  },
  'referrer-policy': {
    required: true,
    description: 'Referrer-Policy - Controls referrer information leakage',
    validate: (value) => [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ].includes(value.toLowerCase())
  },
  'permissions-policy': {
    required: true,
    description: 'Permissions-Policy - Controls browser feature access',
    validate: (value) => value.length > 0 && value.includes('()')
  },
  'strict-transport-security': {
    required: true,
    description: 'HSTS - Forces HTTPS connections',
    validate: (value) => value.includes('max-age=') && parseInt(value.match(/max-age=(\d+)/)?.[1] || '0') >= 31536000
  },
  'x-xss-protection': {
    required: false,
    description: 'X-XSS-Protection - Legacy XSS protection (optional)',
    validate: (value) => value.includes('1') && value.includes('mode=block')
  },
  'cross-origin-embedder-policy': {
    required: false,
    description: 'COEP - Controls cross-origin resource embedding',
    validate: (value) => ['require-corp', 'unsafe-none'].includes(value.toLowerCase())
  },
  'cross-origin-opener-policy': {
    required: false,
    description: 'COOP - Controls cross-origin window interactions',
    validate: (value) => ['same-origin', 'same-origin-allow-popups', 'unsafe-none'].includes(value.toLowerCase())
  },
  'cross-origin-resource-policy': {
    required: false,
    description: 'CORP - Controls cross-origin resource sharing',
    validate: (value) => ['same-site', 'same-origin', 'cross-origin'].includes(value.toLowerCase())
  }
};

function testSecurityHeaders(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.path || '/',
      method: 'HEAD',
      headers: {
        'User-Agent': 'Security-Headers-Test/1.0'
      }
    };

    const req = client.request(options, (res) => {
      const results = {
        url: targetUrl,
        status: res.statusCode,
        headers: res.headers,
        security: {
          passed: [],
          failed: [],
          missing: [],
          warnings: []
        }
      };

      // Test each required header
      Object.entries(REQUIRED_HEADERS).forEach(([headerName, config]) => {
        const headerValue = res.headers[headerName.toLowerCase()];
        
        if (!headerValue) {
          if (config.required) {
            results.security.missing.push({
              header: headerName,
              description: config.description,
              severity: 'HIGH'
            });
          } else {
            results.security.warnings.push({
              header: headerName,
              description: config.description,
              message: 'Optional header not present'
            });
          }
          return;
        }

        if (config.validate(headerValue)) {
          results.security.passed.push({
            header: headerName,
            value: headerValue,
            description: config.description
          });
        } else {
          results.security.failed.push({
            header: headerName,
            value: headerValue,
            description: config.description,
            severity: config.required ? 'HIGH' : 'MEDIUM'
          });
        }
      });

      resolve(results);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function printResults(results) {
  console.log('\n🔒 Security Headers Analysis Report');
  console.log('=====================================');
  console.log(`URL: ${results.url}`);
  console.log(`Status: ${results.status}`);
  console.log('');

  // Passed headers
  if (results.security.passed.length > 0) {
    console.log('✅ PASSED HEADERS:');
    results.security.passed.forEach(item => {
      console.log(`   ${item.header}: ${item.value}`);
      console.log(`   └─ ${item.description}`);
    });
    console.log('');
  }

  // Failed headers
  if (results.security.failed.length > 0) {
    console.log('❌ FAILED HEADERS:');
    results.security.failed.forEach(item => {
      console.log(`   ${item.header}: ${item.value} [${item.severity}]`);
      console.log(`   └─ ${item.description}`);
    });
    console.log('');
  }

  // Missing headers
  if (results.security.missing.length > 0) {
    console.log('🚨 MISSING HEADERS:');
    results.security.missing.forEach(item => {
      console.log(`   ${item.header} [${item.severity}]`);
      console.log(`   └─ ${item.description}`);
    });
    console.log('');
  }

  // Warnings
  if (results.security.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.security.warnings.forEach(item => {
      console.log(`   ${item.header}`);
      console.log(`   └─ ${item.message}`);
    });
    console.log('');
  }

  // Summary
  const total = Object.keys(REQUIRED_HEADERS).length;
  const passed = results.security.passed.length;
  const failed = results.security.failed.length;
  const missing = results.security.missing.length;
  
  console.log('📊 SUMMARY:');
  console.log(`   Total Headers Checked: ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Missing: ${missing}`);
  
  const score = Math.round((passed / total) * 100);
  console.log(`   Security Score: ${score}%`);
  
  if (score >= 90) {
    console.log('   Grade: A+ 🏆');
  } else if (score >= 80) {
    console.log('   Grade: A 🥇');
  } else if (score >= 70) {
    console.log('   Grade: B 🥈');
  } else if (score >= 60) {
    console.log('   Grade: C 🥉');
  } else {
    console.log('   Grade: F ❌');
  }
}

// Main execution
const targetUrl = process.argv[2] || 'http://localhost:3000';

console.log(`Testing security headers for: ${targetUrl}`);

testSecurityHeaders(targetUrl)
  .then(printResults)
  .catch(err => {
    console.error('Error testing security headers:', err.message);
    process.exit(1);
  });