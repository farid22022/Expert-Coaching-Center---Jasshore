import { motion } from "framer-motion";
import { fadeIn } from "./motionVariants.js";

function State({ children, error = false }) {
  return <motion.div variants={fadeIn} initial="hidden" animate="show" role={error ? "alert" : "status"} className={`state${error ? " error" : ""}`}>{children}</motion.div>;
}
export function LoadingState() { return <State>Loading information...</State>; }
export function EmptyState({ text = "No records available." }) { return <State>{text}</State>; }
export function ErrorState({ text = "Something went wrong." }) { return <State error>{text}</State>; }
