import api from "./api.js";
let pending;
const unwrap=response=>response.data?.data||response.data;
/** Coalesce StrictMode/parallel consumers so a legacy refresh token is exchanged only once. */
export function loadDeviceSessions(){
  if(pending)return pending;
  pending=(async()=>{let data=unwrap(await api.get("/auth/me/sessions/"));if(data.managed===false&&localStorage.getItem("refresh_token")){const upgraded=unwrap(await api.post("/auth/me/sessions/",{refresh:localStorage.getItem("refresh_token")}));if(upgraded.access){localStorage.setItem("access_token",upgraded.access);localStorage.setItem("refresh_token",upgraded.refresh);window.dispatchEvent(new Event("authchange"));}data=unwrap(await api.get("/auth/me/sessions/"));}return data;})().finally(()=>{pending=null;});
  return pending;
}
