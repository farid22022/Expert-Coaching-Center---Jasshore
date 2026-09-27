import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { notices, news, events } from "../data/mockData.js";
import { publicNoticeApi } from "../services/resourceApi.js";

const map = { notices, news, events };
const normalizeNotice = (item) => ({
  ...item,
  id: String(item.id),
  date: item.publish_at || item.created_at,
  summary: item.summary || item.body,
  category: item.category || item.course_title || "Notice",
});

export function ListingPage({ type, title }) {
  const [remoteNotices, setRemoteNotices] = useState([]);
  useEffect(() => { if (type === "notices") publicNoticeApi.list().then((rows) => setRemoteNotices(rows.map(normalizeNotice))).catch(() => setRemoteNotices([])); }, [type]);
  const items = type === "notices" ? remoteNotices : map[type];
  return <><SEO title={title} /><PageHeader title={title} eyebrow="Others" /><section className="section"><div className="container card-grid">{items.map((item) => <article className="card content-card" key={item.id}>{item.image && <img src={item.image} alt={item.title} />}<span className="badge">{item.category || item.date}</span><h2>{item.title}</h2><p>{item.summary || item.description}</p><Link className="btn" to={`/${type}/${item.id}`}>Read More</Link></article>)}{!items.length && <article className="card content-card"><span className="badge">Notice</span><h2>No notices published yet</h2><p>Please check back later for the latest admission updates.</p></article>}</div></section></>;
}
export function DetailPage({ type, title }) {
  const { id } = useParams();
  const [remoteNotices, setRemoteNotices] = useState([]);
  const [loaded, setLoaded] = useState(type !== "notices");
  useEffect(() => {
    if (type === "notices") {
      setLoaded(false);
      publicNoticeApi.list().then((rows) => setRemoteNotices(rows.map(normalizeNotice))).catch(() => setRemoteNotices([])).finally(() => setLoaded(true));
    }
  }, [type]);
  const item = useMemo(() => (type === "notices" ? remoteNotices : map[type]).find((x) => String(x.id) === String(id)), [id, remoteNotices, type]);
  if (!loaded) return <><SEO title={title} /><PageHeader title={title} description="Loading notice details..." /></>;
  if (!item) return <><SEO title="Not Found" /><PageHeader title="Content Not Found" /></>;
  return <><SEO title={item.title} /><PageHeader title={item.title} eyebrow={title} description={item.summary || item.description} /><section className="section"><div className="container prose">{item.image && <img className="wide-img" src={item.image} alt={item.title} />}<p>{item.body || item.description}</p><p><strong>Date:</strong> {item.date}</p></div></section></>;
}
