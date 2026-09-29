# Performance changes

- Preserved lazy portal route imports and code splitting. Earlier builds reduced the main bundle from approximately 1,490 KB (446 KB gzip) to 1,021 KB (327 KB gzip); this remains larger than desirable. These are build sizes, not measured user loading times.
- Replaced repeated percentage aggregation with a three-query aggregate path, with regression coverage.
- Reused installed Framer Motion; no new animation dependency. Shared variants use opacity and transforms with short transitions and small card stagger.
- Public section reveals run once per section. Flaticon videos play once on visibility, use `preload="none"`, and have static SVG fallbacks for reduced motion.
- Added application-wide `MotionConfig reducedMotion="user"`; shared components use reduced-motion variants. CSS removes nonessential transitions for reduced-motion users.
- Removed continuous shader backgrounds from active login/register pages and removed modal backdrop blur.

Not measured: production Core Web Vitals, low-end-device frame rate, production network/server load, or every route. Do not interpret these changes as a zero-lag guarantee. A final production build completed locally; broader authenticated browser checks remain outstanding.
