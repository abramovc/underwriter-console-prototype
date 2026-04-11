import {
  buildInsightSummaries,
  formatBucketDebug
} from './insightSummaries.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prettyLabel(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function renderActionChips(actions = []) {
  if (!actions.length) {
    return '<div class="insight-debug-empty">No recommended actions</div>';
  }

  return `
    <div class="insight-debug-chip-row">
      ${actions
        .map(
          (action) => `
            <span class="insight-debug-chip insight-debug-chip-action">
              ${escapeHtml(action.label)}
            </span>
          `
        )
        .join('')}
    </div>
  `;
}

function renderEvidenceList(items = []) {
  if (!items.length) {
    return '<div class="insight-debug-empty">No evidence preview available</div>';
  }

  return `
    <div class="insight-debug-evidence-list">
      ${items
        .map(
          (item) => `
            <div class="insight-debug-evidence-item">
              <div class="insight-debug-evidence-top">
                <strong>${escapeHtml(item.label || 'Unnamed signal')}</strong>
              </div>
              <div class="insight-debug-evidence-meta">
                <span>${escapeHtml(item.provider || 'Unknown provider')}</span>
                ${item.code ? `<span>Code: ${escapeHtml(item.code)}</span>` : ''}
                ${item.canonicalConcept ? `<span>${escapeHtml(prettyLabel(item.canonicalConcept))}</span>` : ''}
              </div>
              <div class="insight-debug-chip-row">
                <span class="insight-debug-chip insight-debug-chip-severity insight-debug-chip-${escapeHtml(item.severity || 'medium')}">
                  ${escapeHtml(prettyLabel(item.severity || 'medium'))}
                </span>
                <span class="insight-debug-chip insight-debug-chip-disposition">
                  ${escapeHtml(prettyLabel(item.disposition || 'neutral'))}
                </span>
              </div>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function renderSummaryCards(summaries = []) {
  if (!summaries.length) {
    return '<div class="insight-debug-empty">No insight summaries were generated.</div>';
  }

  return summaries
    .map((summary) => {
      const debug = formatBucketDebug(summary);

      return `
        <section class="insight-debug-card">
          <div class="insight-debug-card-header">
            <div>
              <h3>${escapeHtml(summary.label)}</h3>
              <div class="insight-debug-subtle">
                ${escapeHtml(summary.reviewQuestion || '')}
              </div>
            </div>
            <div class="insight-debug-card-stats">
              <span class="insight-debug-chip insight-debug-chip-severity insight-debug-chip-${escapeHtml(summary.severity)}">
                ${escapeHtml(prettyLabel(summary.severity))}
              </span>
              <span class="insight-debug-chip insight-debug-chip-stance">
                ${escapeHtml(prettyLabel(summary.stance))}
              </span>
              <span class="insight-debug-chip">
                ${escapeHtml(String(summary.count))} signal${summary.count === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <p class="insight-debug-narrative">
            ${escapeHtml(summary.narrative || '')}
          </p>

          <div class="insight-debug-section">
            <div class="insight-debug-section-title">Recommended actions</div>
            ${renderActionChips(summary.recommendedActions || [])}
          </div>

          <div class="insight-debug-section">
            <div class="insight-debug-section-title">Evidence preview</div>
            ${renderEvidenceList(summary.evidencePreview || [])}
          </div>

          <details class="insight-debug-details">
            <summary>Debug details</summary>
            <pre>${escapeHtml(JSON.stringify(debug, null, 2))}</pre>
          </details>
        </section>
      `;
    })
    .join('');
}

function buildPanelHtml(result) {
  const topAction = result?.overview?.topRecommendedAction || null;

  return `
    <section class="insight-debug-panel">
      <div class="insight-debug-panel-header">
        <div>
          <div class="insight-debug-kicker">Insight Debug View</div>
          <h2>Canonical insight buckets</h2>
          <p class="insight-debug-overview-headline">
            ${escapeHtml(result?.overview?.headline || 'No overview headline generated.')}
          </p>
          <p class="insight-debug-overview-subheadline">
            ${escapeHtml(result?.overview?.subheadline || '')}
          </p>
        </div>
        <div class="insight-debug-overview-stats">
          <div class="insight-debug-stat">
            <span class="insight-debug-stat-label">Blocking</span>
            <strong>${escapeHtml(String(result?.overview?.blockingCount ?? 0))}</strong>
          </div>
          <div class="insight-debug-stat">
            <span class="insight-debug-stat-label">Review</span>
            <strong>${escapeHtml(String(result?.overview?.reviewCount ?? 0))}</strong>
          </div>
          <div class="insight-debug-stat">
            <span class="insight-debug-stat-label">Supportive</span>
            <strong>${escapeHtml(String(result?.overview?.supportiveCount ?? 0))}</strong>
          </div>
        </div>
      </div>

      <div class="insight-debug-top-action">
        <div class="insight-debug-section-title">Top recommended action</div>
        ${
          topAction
            ? `
              <div class="insight-debug-top-action-card">
                <strong>${escapeHtml(topAction.label)}</strong>
                <p>${escapeHtml(topAction.shortWhy || '')}</p>
                ${
                  topAction.sourceBuckets?.length
                    ? `<div class="insight-debug-subtle">Triggered by: ${escapeHtml(topAction.sourceBuckets.join(', '))}</div>`
                    : ''
                }
              </div>
            `
            : '<div class="insight-debug-empty">No top action recommended</div>'
        }
      </div>

      <div class="insight-debug-section">
        <div class="insight-debug-section-title">Cross-bucket recommended actions</div>
        ${renderActionChips(result?.recommendedActions || [])}
      </div>

      <div class="insight-debug-grid">
        ${renderSummaryCards(result?.summaries || [])}
      </div>
    </section>
  `;
}

function ensureStyles() {
  if (document.getElementById('insight-debug-styles')) return;

  const style = document.createElement('style');
  style.id = 'insight-debug-styles';
  style.textContent = `
    .insight-debug-panel {
      margin: 24px 0;
      padding: 20px;
      border: 1px solid #d9e0ea;
      border-radius: 16px;
      background: #f8fafc;
    }

    .insight-debug-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 20px;
    }

    .insight-debug-kicker {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
    }

    .insight-debug-panel h2 {
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.2;
    }

    .insight-debug-overview-headline {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }

    .insight-debug-overview-subheadline,
    .insight-debug-subtle {
      margin: 0;
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }

    .insight-debug-overview-stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .insight-debug-stat {
      min-width: 88px;
      padding: 12px 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #dbe4ee;
    }

    .insight-debug-stat-label {
      display: block;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .insight-debug-top-action,
    .insight-debug-section {
      margin-bottom: 18px;
    }

    .insight-debug-section-title {
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }

    .insight-debug-top-action-card {
      padding: 14px 16px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #dbe4ee;
    }

    .insight-debug-top-action-card p {
      margin: 6px 0;
      color: #475569;
      font-size: 14px;
      line-height: 1.5;
    }

    .insight-debug-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .insight-debug-card {
      background: #ffffff;
      border: 1px solid #dbe4ee;
      border-radius: 14px;
      padding: 16px;
    }

    .insight-debug-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 12px;
    }

    .insight-debug-card h3 {
      margin: 0 0 4px;
      font-size: 18px;
      line-height: 1.3;
      color: #0f172a;
    }

    .insight-debug-card-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .insight-debug-narrative {
      margin: 0 0 16px;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }

    .insight-debug-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .insight-debug-chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: #eef2f7;
      color: #334155;
      font-size: 12px;
      line-height: 1;
      border: 1px solid #dde5ef;
    }

    .insight-debug-chip-action {
      background: #ecfeff;
      border-color: #bae6fd;
      color: #0f172a;
    }

    .insight-debug-chip-severity.insight-debug-chip-high {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    .insight-debug-chip-severity.insight-debug-chip-medium {
      background: #fff7ed;
      border-color: #fed7aa;
      color: #9a3412;
    }

    .insight-debug-chip-severity.insight-debug-chip-low {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }

    .insight-debug-chip-stance,
    .insight-debug-chip-disposition {
      background: #f8fafc;
    }

    .insight-debug-evidence-list {
      display: grid;
      gap: 10px;
    }

    .insight-debug-evidence-item {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      background: #f8fafc;
    }

    .insight-debug-evidence-top {
      margin-bottom: 6px;
      color: #0f172a;
      font-size: 14px;
    }

    .insight-debug-evidence-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #64748b;
    }

    .insight-debug-details {
      margin-top: 12px;
    }

    .insight-debug-details summary {
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .insight-debug-details pre {
      margin-top: 10px;
      padding: 12px;
      border-radius: 12px;
      background: #0f172a;
      color: #e2e8f0;
      overflow: auto;
      font-size: 12px;
      line-height: 1.5;
    }

    .insight-debug-empty {
      color: #64748b;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .insight-debug-panel-header {
        flex-direction: column;
      }

      .insight-debug-card-header {
        flex-direction: column;
      }

      .insight-debug-card-stats {
        justify-content: flex-start;
      }
    }
  `;

  document.head.appendChild(style);
}

export function renderInsightDebugPanel({
  container,
  signals = [],
  insert = 'prepend'
} = {}) {
  if (!container) {
    console.warn('renderInsightDebugPanel: missing container');
    return null;
  }

  ensureStyles();

  const result = buildInsightSummaries(signals);
  const wrapper = document.createElement('div');
  wrapper.className = 'insight-debug-root';
  wrapper.innerHTML = buildPanelHtml(result);

  const existing = container.querySelector('.insight-debug-root');
  if (existing) existing.remove();

  if (insert === 'append') {
    container.appendChild(wrapper);
  } else {
    container.prepend(wrapper);
  }

  return result;
}

export function mountInsightDebugPanel({
  targetSelector = '#queue-root, main, .page-content, body',
  signals = [],
  insert = 'prepend'
} = {}) {
  const selectors = String(targetSelector)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  let container = null;
  for (const selector of selectors) {
    container = document.querySelector(selector);
    if (container) break;
  }

  if (!container) {
    console.warn('mountInsightDebugPanel: no container found for selectors', targetSelector);
    return null;
  }

  return renderInsightDebugPanel({
    container,
    signals,
    insert
  });
}