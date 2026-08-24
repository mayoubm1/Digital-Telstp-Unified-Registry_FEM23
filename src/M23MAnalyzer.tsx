import { FormEvent, useState } from 'react';
import axios from 'axios';
import { BookOpenText, LoaderCircle, Send, ShieldCheck } from 'lucide-react';

interface PublicationReference {
  id: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  doi?: string | null;
}

interface AnalysisResult {
  query: string;
  analysis: string;
  pillar: string;
  publications_used: PublicationReference[];
  publications_count: number;
  model_used: string;
  timestamp: string;
  persistence: 'disabled';
}

interface M23MAnalyzerProps {
  apiBase: string;
  accessToken: string;
}

const pillars = [
  { value: 'general', label: 'General research' },
  { value: 'research', label: 'Life sciences' },
  { value: 'quantum-biology', label: 'Quantum biology' },
  { value: 'genomics', label: 'Genomics' },
  { value: 'neuroscience', label: 'Neuroscience' },
  { value: 'telemedicine', label: 'Telemedicine innovation' },
  { value: 'education', label: 'Education and knowledge' },
];

function messageFromError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'M2-3M could not process this request. Please try again later.';
  }
  return 'M2-3M could not process this request. Please try again later.';
}

export default function M23MAnalyzer({ apiBase, accessToken }: M23MAnalyzerProps) {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [pillar, setPillar] = useState('general');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<{ success: boolean; data: AnalysisResult }>(
        `${apiBase.replace(/\/$/, '')}/m23m/analyze`,
        { query: query.trim(), context: context.trim(), pillar },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 25_000,
        },
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('M2-3M returned an invalid response.');
      }

      setResult(response.data.data);
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="analyzer-panel" aria-labelledby="m23m-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">M2-3M research engine</p>
          <h2 id="m23m-title">Evidence-aware analysis</h2>
          <p className="section-copy">
            Explore approved TELsTP research themes. The isolated candidate never stores an analysis from this screen.
          </p>
        </div>
        <div className="status-chip"><ShieldCheck size={16} /> Authenticated session</div>
      </div>

      <form className="analysis-form" onSubmit={handleSubmit}>
        <label>
          Research question
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={1200}
            required
            rows={5}
            placeholder="For example: What evidence would be needed to evaluate quantum effects in biological energy transfer?"
          />
          <span className="field-help">{query.length}/1200 characters</span>
        </label>

        <div className="form-grid">
          <label>
            Research pillar
            <select value={pillar} onChange={(event) => setPillar(event.target.value)}>
              {pillars.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            Optional context
            <input
              value={context}
              onChange={(event) => setContext(event.target.value)}
              maxLength={2000}
              placeholder="Scope, intended audience, or research goal"
            />
          </label>
        </div>

        <div className="form-footer">
          <p><BookOpenText size={17} /> Responses are grounded in approved references when the protected research provider is activated.</p>
          <button className="primary-button" type="submit" disabled={loading || !query.trim()}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
            {loading ? 'Preparing analysis…' : 'Analyze with M2-3M'}
          </button>
        </div>
      </form>

      {error && <div className="callout error-callout" role="alert">{error}</div>}

      {result && (
        <article className="analysis-result" aria-live="polite">
          <div className="result-meta">
            <span>{result.pillar}</span>
            <span>{result.publications_count} approved reference{result.publications_count === 1 ? '' : 's'}</span>
            <span>Persistence: {result.persistence}</span>
          </div>
          <h3>Research brief</h3>
          <div className="analysis-text">{result.analysis}</div>
          <h4>Reference trace</h4>
          {result.publications_used.length ? (
            <ol className="reference-list">
              {result.publications_used.map((publication) => (
                <li key={publication.id}>
                  <strong>{publication.title}</strong>
                  {(publication.authors || publication.year) && <span> — {[publication.authors, publication.year].filter(Boolean).join(', ')}</span>}
                  {publication.doi && <span className="doi"> DOI: {publication.doi}</span>}
                </li>
              ))}
            </ol>
          ) : <p className="muted">No approved internal references were supplied for this result.</p>}
        </article>
      )}
    </section>
  );
}
