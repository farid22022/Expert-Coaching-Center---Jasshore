import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import SEO from "../components/common/SEO.jsx";
import Reveal from "../components/common/Reveal.jsx";
import { staggerContainer, staggerItem } from "../components/common/motionVariants.js";
import { publicSuccessStoryApi } from "../services/resourceApi.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const eyebrowClass = "text-xs font-bold uppercase tracking-[0.14em] text-emerald-700";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicSuccessStoryApi
      .list()
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Success Stories" description="Real admission success stories from Expert Coaching Center students." />

      <section className="py-16 sm:py-20">
        <Reveal className={containerClass}>
          <div className="mb-10 text-center">
            <p className={eyebrowClass}>Real outcomes</p>
            <h1 className="mt-1 text-3xl font-black text-emerald-950 sm:text-4xl">Admission Success Stories</h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Hear directly from students who found their path with structured coaching, regular assessment, and dedicated mentorship.
            </p>
          </div>

          {loading && <p className="text-center text-slate-400">Loading...</p>}

          {!loading && stories.length === 0 && (
            <p className="text-center text-slate-400">No success stories published yet.</p>
          )}

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stories.map((story) => (
              <motion.article
                key={story.id}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
              >
                <Quote className="h-6 w-6 text-emerald-700" />
                {story.quote && <p className="leading-6 text-slate-700">&ldquo;{story.quote}&rdquo;</p>}
                <div className="mt-2 border-t border-emerald-100 pt-3">
                  <p className="font-black text-emerald-950">{story.name}</p>
                  {story.outcome && <p className="text-sm font-bold text-emerald-700">{story.outcome}</p>}
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Reveal>
      </section>
    </>
  );
}
