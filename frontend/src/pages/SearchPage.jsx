import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { notices, news, events } from "../data/mockData.js";
import { navGroups } from "../data/site.js";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const pages = navGroups.flatMap((g) => g.items ? g.items.map(([title, path]) => ({ title, path })) : [{ title: g.label, path: g.path }]);
  const groups = useMemo(() => ({
    Notices: notices.map((x) => ({ ...x, path: `/notices/${x.id}` })),
    News: news.map((x) => ({ ...x, path: `/news/${x.id}` })),
    Events: events.map((x) => ({ ...x, path: `/events/${x.id}` })),
    Pages: pages,
  }), []);
  return <><SEO title="Search" /><PageHeader title="Search Results" /><section className="section"><div className="container"><input className="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notices, news, events, pages" />{Object.entries(groups).map(([name, items]) => { const filtered = items.filter((i) => (i.title || "").toLowerCase().includes(q.toLowerCase())); return <div className="search-group" key={name}><h2>{name}</h2>{filtered.map((i) => <Link key={i.path} to={i.path}>{i.title}</Link>)}</div>; })}</div></section></>;
}
