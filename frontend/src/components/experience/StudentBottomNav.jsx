import { NavLink } from "react-router-dom";
import { House, BookOpen, ClipboardList, Trophy, UserRound } from "lucide-react";
const items=[["Home","/student/dashboard",House],["Courses","/student/dashboard/courses",BookOpen],["Tests","/student/dashboard/assessments",ClipboardList],["Results","/student/dashboard/results",Trophy],["Profile","/student/dashboard/profile",UserRound]];
export default function StudentBottomNav(){return <nav className="campus-bottom-nav" aria-label="Student quick navigation">{items.map(([label,to,Icon])=><NavLink key={to} to={to} end={to==="/student/dashboard"}><Icon size={20} aria-hidden="true"/><span>{label}</span></NavLink>)}</nav>;}
