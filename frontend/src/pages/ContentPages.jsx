import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { notices, news, events } from "../data/mockData.js";

const map = { notices, news, events };
export function ListingPage({ type, title }) {
  const items = map[type];
  return <><SEO title={title} /><PageHeader title={title} eyebrow="Others" /><section className="section"><div className="container card-grid">{items.map((item) => <article className="card content-card" key={item.id}>{item.image && <img src={item.image} alt={item.title} />}<span className="badge">{item.category || item.date}</span><h2>{item.title}</h2><p>{item.summary || item.description}</p><Link className="btn" to={`/${type}/${item.id}`}>Read More</Link></article>)}</div></section></>;
}
export function DetailPage({ type, title }) {
  const { id } = useParams();
  const item = map[type].find((x) => x.id === id);
  if (!item) return <><SEO title="Not Found" /><PageHeader title="Content Not Found" /></>;
  return <><SEO title={item.title} /><PageHeader title={item.title} eyebrow={title} description={item.summary || item.description} /><section className="section"><div className="container prose">{item.image && <img className="wide-img" src={item.image} alt={item.title} />}<p>{item.body || item.description}</p><p><strong>Date:</strong> {item.date}</p></div></section></>;
}
