export const duration = { instant: .08, fast: .16, base: .24, slow: .4, scene: .8 };
export const ease = [.22, 1, .36, 1];
export const page = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: duration.base, ease } }, exit: { opacity: 0 } };
export const section = { hidden: {}, show: { transition: { staggerChildren: .05 } } };
export const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: duration.base, ease } } };
export const press = { scale: .97, transition: { type: "spring", stiffness: 420, damping: 30 } };
