"use client";

import { useState } from "react";

export default function LoginPage(){

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [loading,setLoading]=useState(false);

async function login(){

setLoading(true);

const res=await fetch("/api/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
});

const data=await res.json();

setLoading(false);

if(!res.ok){
alert(data.message);
return;
}

window.location.href="/dashboard";

}

return(

<div style={{
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#2563eb,#7c3aed)"
}}>

<div style={{
width:420,
background:"#fff",
padding:40,
borderRadius:20
}}>

<h1>SATSET ERP</h1>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="Email"
/>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
placeholder="Password"
/>

<button onClick={login}>
{loading ? "Loading..." : "LOGIN"}
</button>

</div>

</div>

);

}
