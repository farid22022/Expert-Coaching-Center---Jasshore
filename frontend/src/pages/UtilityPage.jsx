import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";

export default function UtilityPage({ title }) {
  return <><SEO title={title} /><PageHeader title={title} description="This public information page is prepared for future backend resources and document downloads." /><section className="section"><div className="container card"><p>No private records are exposed here. When the official public backend is connected, verified records or downloadable resources can appear on this page.</p><button className="btn" onClick={() => window.print()}>Print</button></div></section></>;
}

export function NotFound() {
  return <><SEO title="404" /><section className="page-header"><div className="container"><h1>404</h1><p>Page Not Found</p><p>The page you're looking for doesn't exist.</p><a className="btn primary" href="/">Back to Home</a></div></section></>;
}
