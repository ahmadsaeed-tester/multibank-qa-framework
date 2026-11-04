const fs = require('fs');

const browserDetails = {
  'Desktop-Chrome': {
    name: 'Google Chrome',
    channel: 'chrome',
    engine: 'Chromium',
    viewport: '1440 × 900',
    mode: 'Desktop'
  },
  'Desktop-Edge': {
    name: 'Microsoft Edge',
    channel: 'msedge',
    engine: 'Chromium',
    viewport: '1440 × 900',
    mode: 'Desktop'
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function classifyResult(results) {
  const latest = results[results.length - 1] || {};
  const status = latest.status;
  if (status === 'passed') {
    return results.some(result => result.status !== 'passed')
      ? { label: 'Flaky', className: 'status-flaky' }
      : { label: 'Passed', className: 'status-passed' };
  }
  if (status === 'failed' || status === 'unexpected') {
    return { label: 'Failed', className: 'status-failed' };
  }
  if (status === 'skipped') {
    return { label: 'Skipped', className: 'status-skipped' };
  }
  return { label: 'Broken', className: 'status-broken' };
}

let data;
try {
  const file = fs.readFileSync('test-results.json');
  const text = file[0] === 0xff && file[1] === 0xfe
    ? file.toString('utf16le').replace(/^\uFEFF/, '')
    : file.toString('utf8').replace(/^\uFEFF/, '');
  data = JSON.parse(text);
} catch (error) {
  console.error('Could not read or parse test-results.json:', error.message);
  process.exit(1);
}

if (!Array.isArray(data.suites)) {
  console.error('test-results.json does not contain Playwright test suites.');
  process.exit(1);
}

const testCases = [];
function parseSuite(suite, parentFile = '') {
  const suiteFile = suite.file || parentFile;
  for (const spec of suite.specs || []) {
    const file = spec.file || suiteFile;
    for (const test of spec.tests || []) {
      if (!browserDetails[test.projectName]) continue;
      const results = test.results || [];
      const latest = results[results.length - 1] || {};
      const resultStatus = classifyResult(results);
      const error = latest.error?.message
        || (latest.errors || []).map(item => item.message).filter(Boolean).join('\n')
        || '';
      testCases.push({
        browser: test.projectName,
        title: spec.title,
        file: String(file).replace(/\\/g, '/'),
        status: resultStatus.label,
        badgeClass: resultStatus.className,
        duration: Number.isFinite(latest.duration) ? `${(latest.duration / 1000).toFixed(2)}s` : '—',
        retries: Math.max(0, results.length - 1),
        error
      });
    }
  }
  for (const child of suite.suites || []) parseSuite(child, suiteFile);
}
data.suites.forEach(suite => parseSuite(suite));

if (testCases.length === 0) {
  console.error('No Chrome Desktop or Edge Desktop test results found; report was not generated.');
  process.exit(1);
}

const browserSummaries = Object.entries(browserDetails).map(([project, details]) => {
  const cases = testCases.filter(test => test.browser === project);
  return {
    project,
    ...details,
    total: cases.length,
    passed: cases.filter(test => test.status === 'Passed').length,
    flaky: cases.filter(test => test.status === 'Flaky').length,
    failed: cases.filter(test => test.status === 'Failed').length,
    broken: cases.filter(test => test.status === 'Broken').length,
    skipped: cases.filter(test => test.status === 'Skipped').length
  };
});

const total = testCases.length;
const passed = testCases.filter(test => test.status === 'Passed').length;
const flaky = testCases.filter(test => test.status === 'Flaky').length;
const failed = testCases.filter(test => test.status === 'Failed').length;
const broken = testCases.filter(test => test.status === 'Broken').length;
const skipped = testCases.filter(test => test.status === 'Skipped').length;
const duration = Number.isFinite(data.stats?.duration) ? `${(data.stats.duration / 1000).toFixed(1)}s` : '—';
const startedAt = data.stats?.startTime ? new Date(data.stats.startTime).toLocaleString() : 'Not recorded';
const testRows = testCases.map(test => `
            <tr>
              <td><span class="browser-name">${escapeHtml(browserDetails[test.browser].name)}</span><span class="subtle">${escapeHtml(test.browser)}</span></td>
              <td><span class="badge ${test.badgeClass}">${test.status}</span></td>
              <td>
                <div class="test-title">${escapeHtml(test.title)}</div>
                ${test.error ? `<div class="error-text">${escapeHtml(test.error)}</div>` : ''}
              </td>
              <td class="file-path">${escapeHtml(test.file)}</td>
              <td>${escapeHtml(test.duration)}</td>
              <td>${test.retries}</td>
            </tr>`).join('');
const browserRows = browserSummaries.map(browser => `
          <tr>
            <td><span class="browser-name">${escapeHtml(browser.name)}</span><span class="subtle">${escapeHtml(browser.project)}</span></td>
            <td>${escapeHtml(browser.channel)}</td>
            <td>${escapeHtml(browser.engine)}</td>
            <td>${escapeHtml(browser.mode)}</td>
            <td>${escapeHtml(browser.viewport)}</td>
            <td>${browser.total}</td>
            <td class="passed-text">${browser.passed}</td>
            <td class="flaky-text">${browser.flaky}</td>
            <td class="failed-text">${browser.failed}</td>
            <td class="broken-text">${browser.broken}</td>
            <td>${browser.skipped}</td>
          </tr>`).join('');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mb.io - QA Test Execution Report</title>
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-color: #f8fafc;
      --text-muted: #94a3b8;
      --border-color: #334155;
      --passed-color: #22c55e;
      --flaky-color: #eab308;
      --failed-color: #ef4444;
      --broken-color: #f59e0b;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0;
      font-size: 26px;
      color: #38bdf8;
    }
    .meta {
      color: var(--text-muted);
      font-size: 14px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card .value {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .card.total .value { color: #38bdf8; }
    .card.passed .value { color: var(--passed-color); }
    .card.flaky .value { color: var(--flaky-color); }
    .card.failed .value { color: var(--failed-color); }
    .card.broken .value { color: var(--broken-color); }
    .card.skipped .value { color: var(--text-muted); }
    
    .table-container {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow-x: auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 760px;
    }
    th, td {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
    }
    th {
      background-color: #0f172a;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: rgba(56, 189, 248, 0.05);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-passed { background-color: rgba(34, 197, 94, 0.2); color: var(--passed-color); border: 1px solid rgba(34, 197, 94, 0.3); }
    .status-flaky { background-color: rgba(234, 179, 8, 0.2); color: var(--flaky-color); border: 1px solid rgba(234, 179, 8, 0.3); }
    .status-failed { background-color: rgba(239, 68, 68, 0.2); color: var(--failed-color); border: 1px solid rgba(239, 68, 68, 0.3); }
    .status-broken { background-color: rgba(245, 158, 11, 0.2); color: var(--broken-color); border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-skipped { background-color: rgba(148, 163, 184, 0.15); color: var(--text-muted); border: 1px solid rgba(148, 163, 184, 0.3); }
    .section-title { margin: 0 0 14px; font-size: 19px; }
    .run-meta { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-bottom: 24px; }
    .browser-name { display: block; font-weight: 600; }
    .subtle, .file-path { color: var(--text-muted); font-size: 12px; }
    .file-path { font-family: monospace; }
    .test-title { font-weight: 600; }
    .passed-text { color: var(--passed-color); }
    .flaky-text { color: var(--flaky-color); }
    .failed-text { color: var(--failed-color); }
    .broken-text { color: var(--broken-color); }
    
    .error-text {
      color: var(--failed-color);
      font-family: monospace;
      font-size: 12px;
      margin-top: 4px;
      max-width: 560px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    @media (max-width: 640px) {
      body { padding: 14px; }
      header { align-items: flex-start; flex-direction: column; gap: 12px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>mb.io - Cross-Browser Test Report</h1>
        <div class="meta">Desktop browser coverage: Google Chrome and Microsoft Edge</div>
      </div>
      <div class="meta">Report generated: ${new Date().toLocaleString()}</div>
    </header>

    <div class="run-meta meta">
      <span><strong>Run started:</strong> ${escapeHtml(startedAt)}</span>
      <span><strong>Total run duration:</strong> ${escapeHtml(duration)}</span>
      <span><strong>Included projects:</strong> Desktop-Chrome, Desktop-Edge</span>
    </div>

    <div class="summary-cards">
      <div class="card total">
        <h3>Total Tests</h3>
        <p class="value">${total}</p>
      </div>
      <div class="card passed">
        <h3>Passed</h3>
        <p class="value">${passed}</p>
      </div>
      <div class="card flaky">
        <h3>Flaky</h3>
        <p class="value">${flaky}</p>
      </div>
      <div class="card failed">
        <h3>Failed</h3>
        <p class="value">${failed}</p>
      </div>
      <div class="card broken">
        <h3>Broken</h3>
        <p class="value">${broken}</p>
      </div>
      <div class="card skipped">
        <h3>Skipped</h3>
        <p class="value">${skipped}</p>
      </div>
    </div>

    <h2 class="section-title">Browser configuration and results</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Browser / Project</th>
            <th>Channel</th>
            <th>Engine</th>
            <th>Mode</th>
            <th>Viewport</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Flaky</th>
            <th>Failed</th>
            <th>Broken</th>
            <th>Skipped</th>
          </tr>
        </thead>
        <tbody>
          ${browserRows}
        </tbody>
      </table>
    </div>

    <h2 class="section-title">Detailed test results</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Browser</th>
            <th>Status</th>
            <th>Test case / Error</th>
            <th>File path</th>
            <th>Duration</th>
            <th>Retries</th>
          </tr>
        </thead>
        <tbody>
          ${testRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('mb-test-report.html', htmlContent);
console.log(`Detailed cross-browser HTML report generated at mb-test-report.html (${total} tests across ${browserSummaries.filter(browser => browser.total > 0).length} browsers).`);
