"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const savedId = localStorage.getItem('user_id');
    if (savedId) {
      supabase.from('users').select('*').eq('id', savedId).single()
        .then(({ data }) => { if(data) setUser(data); });
    }
  }, []);

  const handleJoin = async () => {
    if(!name) return alert("Please enter a name");
    const { data, error } = await supabase.from('users').insert([{ display_name: name }]).select().single();
    if (error) return alert("Error joining. Check if the name is taken.");
    localStorage.setItem('user_id', data.id);
    setUser(data);
  };

  if (!user) return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'100px', fontFamily:'sans-serif'}}>
      <h1>Join the Platform</h1>
      <input style={{padding:'10px', margin:'10px', borderRadius:'5px', border:'1px solid #ccc'}} placeholder="Your Name" onChange={e => setName(e.target.value)} />
      <button style={{padding:'10px 20px', background:'blue', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}} onClick={handleJoin}>Join Now</button>
    </div>
  );

  return (
    <div style={{textAlign:'center', marginTop:'100px', fontFamily:'sans-serif'}}>
      {user.status === 'pending' && <h2 style={{color: 'orange'}}>Status: Waiting for Admin Approval...</h2>}
      {user.status === 'approved' && <h2 style={{color: 'green'}}>Status: Approved! Welcome {user.display_name}</h2>}
      {user.status === 'kicked' && <h2 style={{color: 'red'}}>Status: Access Denied.</h2>}
    </div>
  );
}
