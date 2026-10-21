import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Monitor, Smartphone, Tablet, ShieldCheck, UserRound } from "lucide-react";
import api, { API_BASE_URL, getApiErrorMessage } from "../../services/api.js";
import { getStoredUser, getDashboardPathForUser, hasRole, isAuthenticated, me, logout } from "../../services/authApi.js";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import { Button, Card, GlassCard, FormField, Select, PasswordInput, Tabs, StatusBadge, ErrorRetry, Skeleton, EmptyState, ConfirmDialog, Timeline } from "../ui/index.jsx";
import { notifySuccess, notifyError } from "../../services/alerts.js";
import AvatarCropUploader from "./AvatarCropUploader.jsx";
import { loadDeviceSessions } from "../../services/sessionApi.js";
import i18n from "../../i18n/index.js";

const unwrap = response => response.data?.data || response.data;
const date = value => value ? new Date(value).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"}) : "Unavailable";
const picture = value => !value || /^https?:/.test(value) ? value : `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
const sections = [{id:"overview",label:"Overview"},{id:"personal",label:"Personal info"},{id:"security",label:"Security"},{id:"devices",label:"Devices"},{id:"preferences",label:"Preferences"}];

/** Shared profile. Existing role permissions and student academic data remain server-authoritative. */
export default function AccountProfile() {
  const navigate = useNavigate();
  const [user,setUser] = useState(getStoredUser);
  const [student,setStudent] = useState(null);
  const [tab,setTab] = useState("overview");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  const [form,setForm] = useState({first_name:"",last_name:"",phone:""});
  const [saving,setSaving] = useState(false);
  const theme = useTheme();
  const load = async () => {
    setLoading(true);setError("");
    try {
      const next=await me({force:true});setUser(next);
      let details=null;
      if(hasRole(next,"student")){try{details=unwrap(await api.get("/courses/student/dashboard/me/"));setStudent(details);}catch{/* Account info stays available if academic profile is unavailable. */}}
      setForm({first_name:next.first_name||"",last_name:next.last_name||"",phone:details?.phone||next.phone||""});
    } catch(err){setError(getApiErrorMessage(err,"Unable to load your profile."));}finally{setLoading(false);}
  };
  useEffect(()=>{if(!isAuthenticated()){navigate("/login",{replace:true});return;}load();},[]);
  const name=[user?.first_name,user?.last_name].filter(Boolean).join(" ")||user?.username||user?.email||"My account";
  const role=user?.is_superuser||user?.is_staff ? "Administrator" : hasRole(user,"teacher") ? "Teacher" : hasRole(user,"student") ? "Student" : "Member";
  const save = async event => {
    event.preventDefault();setSaving(true);
    try {
      const next=unwrap(await api.patch("/auth/me/profile/",form));
      if(hasRole(user,"student") && student){const details=unwrap(await api.patch("/courses/student/dashboard/me/",{phone:form.phone}));setStudent(details);}
      setUser(next);await me({force:true});notifySuccess("Your details have been saved.");
    }catch(err){notifyError(getApiErrorMessage(err,"Could not save your profile."));}finally{setSaving(false);}
  };
  if(loading)return <div className="campus-profile"><Skeleton label="Loading profile" rows={5}/></div>;
  if(error)return <div className="campus-profile"><ErrorRetry message={error} onRetry={load}/></div>;
  const rows=[["Account ID",`USER-${user.id}`],["Email",user.email],["Phone",student?.phone||user.phone||"Not set"],["Joined",user.date_joined?date(user.date_joined):"Unavailable"],...(student ? [["Student ID",student.student_id],["Class",student.academic_class],["Group / Department",student.group],["Section",student.section],["Session",student.session],["Shift",student.shift]] : [])];
  return <div className="campus-profile">
    <GlassCard className="campus-profile-header">
      {user.avatar ? <img className="campus-profile-avatar" src={picture(user.avatar)} alt={`${name}'s profile`} width="90" height="90"/> : <div className="campus-profile-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</div>}
      <div><StatusBadge status="active">{role}</StatusBadge><h1>{name}</h1><p>{user.email}</p></div>
      <Link className="campus-button campus-button--secondary" to={getDashboardPathForUser(user)}>My dashboard</Link>
    </GlassCard>
    <Tabs items={sections} value={tab} onChange={setTab} label="Profile sections"/>
    <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {tab==="overview" && <div className="campus-profile-grid"><Card><h2>Account overview</h2><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||"Not assigned"}</dd></div>)}</dl></Card><Card><h2>Learning memberships</h2>{student?.active_enrollments?.length ? <ul className="grid gap-3">{student.active_enrollments.map(row=><li key={row.id} className="rounded-xl border border-line p-4"><strong>{row.course}</strong></li>)}</ul> : <EmptyState title={student ? "Your next chapter awaits" : "Your workspace is ready"} description={student ? "Approved course memberships will appear here." : "Open your dashboard to view your assigned courses and operations."} action={<Link className="campus-button campus-button--secondary" to={getDashboardPathForUser(user)}>Open dashboard</Link>}/>}</Card></div>}
      {tab==="personal" && <div className="campus-profile-grid"><Card><h2>Personal information</h2><form className="grid gap-5" onSubmit={save}>{[["first_name","First name"],["last_name","Last name"],["phone","Phone number"]].map(([key,label])=><FormField key={key} label={label} type={key==="phone"?"tel":"text"} autoComplete={key==="phone"?"tel":key==="first_name"?"given-name":"family-name"} maxLength={key==="phone"?50:150} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>)}<p className="text-sm text-muted">Email and academic assignments are managed by your institution.</p><Button type="submit" loading={saving}>Save details</Button></form></Card><Card><h2>Profile photo</h2><AvatarCropUploader onSaved={next=>{setUser(next);me({force:true});}}/></Card></div>}
      {tab==="security" && <SecurityPanel/>}
      {tab==="devices" && <DevicesPanel/>}
      {tab==="preferences" && <Card><h2>Make it yours</h2><div className="grid gap-5 max-w-md"><Select label="Appearance" value={theme.preference} onChange={e=>theme.setPreference(e.target.value)}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></Select><Select label="Motion" value={theme.motion} onChange={e=>theme.setMotion(e.target.value)}><option value="system">Use device setting</option><option value="reduce">Reduce motion</option></Select><Select label="Language" value={i18n.resolvedLanguage?.startsWith("bn")?"bn":"en"} onChange={e=>{i18n.changeLanguage(e.target.value);}}><option value="en">English</option><option value="bn">বাংলা</option></Select><p className="text-sm text-muted">Appearance and motion apply to this browser. Your institution controls available notification channels.</p></div></Card>}
    </section>
  </div>;
}

function SecurityPanel(){
  const navigate=useNavigate();const [current,setCurrent]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const strength=[password.length>=8,/[a-z]/.test(password)&&/[A-Z]/.test(password),/\d/.test(password),/[^a-z\d]/i.test(password)].filter(Boolean).length;
  const submit=async event=>{event.preventDefault();if(password!==confirm){setError("The new passwords do not match.");return;}setBusy(true);setError("");try{await api.post("/auth/me/password/",{current_password:current,new_password:password});await logout();notifySuccess("Password changed. Please sign in again.");navigate("/login",{replace:true});}catch(err){setError(getApiErrorMessage(err,"Could not change your password."));}finally{setBusy(false);}};
  return <Card><h2 className="flex gap-2"><ShieldCheck size={22}/> Account security</h2><form className="grid max-w-lg gap-4" onSubmit={submit}><PasswordInput label="Current password" autoComplete="current-password" required value={current} onChange={e=>setCurrent(e.target.value)}/><PasswordInput label="New password" autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/><label className="grid gap-2 text-sm">Password strength: {["Not entered","Weak","Fair","Good","Strong"][strength]}<meter min="0" max="4" value={strength} aria-label="Password strength"/></label><PasswordInput label="Confirm new password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/>{error && <p role="alert" className="campus-field-error">{error}</p>}<p className="text-sm text-muted">Changing your password signs out your devices. Two-step verification and password-change history are not available for this account system.</p><Button type="submit" loading={busy}>Change password and sign out</Button></form></Card>;
}

function DevicesPanel(){
  const navigate=useNavigate();const [data,setData]=useState(null);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [confirm,setConfirm]=useState(null);
  const load=async()=>{setError("");try{setData(await loadDeviceSessions());}catch(err){setError(getApiErrorMessage(err,"Could not load your devices."));}};
  useEffect(()=>{load();},[]);
  const revoke=async()=>{setBusy(true);try{await api.delete(confirm.others?"/auth/me/sessions/?others=true":`/auth/me/sessions/${confirm.id}/`);if(confirm.is_current){await logout();navigate("/login",{replace:true});}else{notifySuccess("Device sessions signed out.");await load();}setConfirm(null);}catch(err){notifyError(getApiErrorMessage(err,"Could not sign out the device."));}finally{setBusy(false);}};
  if(error)return <ErrorRetry message={error} onRetry={load}/>;if(!data)return <Skeleton label="Loading device sessions"/>;
  return <div className="grid gap-5"><Card><div className="flex flex-wrap justify-between gap-4"><div><h2>Your devices</h2><p className="text-sm text-muted">Sessions from managed sign-ins. Addresses are masked; location is not collected. Device history expires after 90 days.</p></div>{data.managed && <Button variant="secondary" onClick={()=>setConfirm({others:true})}>Sign out all other devices</Button>}</div>{data.sessions?.length ? data.sessions.map(row=>{const Icon=row.device_type==="mobile"?Smartphone:row.device_type==="tablet"?Tablet:Monitor;return <article key={row.id} className="campus-device"><Icon size={24} aria-hidden="true"/><div><strong>{row.browser} · {row.os}</strong>{row.is_current && <span className="ml-3"><StatusBadge status="active">This device</StatusBadge></span>}<p>{row.masked_ip} · {row.device_type}</p><p>Signed in {date(row.created_at)} · Last active {date(row.last_active_at)}</p></div><Button variant="secondary" onClick={()=>setConfirm(row)}>Sign out{row.is_current?" this device":""}</Button></article>;}) : <EmptyState kind="empty-devices" title="No managed devices to display" description="Sign in again to register your current device."/>}</Card><Card><h2>Recent sign-ins</h2>{data.sign_ins?.length ? <Timeline items={data.sign_ins.map(row=>({id:row.id,title:"Successful sign-in",description:row.masked_ip,date:row.created_at}))}/> : <p className="text-sm text-muted">No recent sign-in history is available.</p>}</Card><ConfirmDialog open={Boolean(confirm)} title={confirm?.others?"Sign out other devices?":"Sign out this device?"} objectName={confirm?.browser||"Other devices"} consequence={confirm?.is_current?"You will return to the sign-in page. Unsaved work may be lost.":"Access and refresh tokens for these sessions will stop working. Unsaved work may be lost."} loading={busy} onCancel={()=>setConfirm(null)} onConfirm={revoke}/></div>;
}
