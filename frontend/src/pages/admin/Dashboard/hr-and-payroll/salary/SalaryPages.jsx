import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Printer, Trash2 } from "lucide-react";

const BLUE = "#456db5";

const designations = 