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
        .then(({ data }) => setUser(data));
    }
  }, []);

  const handleJoin = async () => {
    const { data, error } = await supabase.from('users').insert([{ display_name: name }]).select().single();
    if (error) return alert("Name taken or system error.");
    localStorage.setItem('user_id', data.id);
    setUser(data);
  };

  if (!user) return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'100px'}}>
      <h1>Join Platform</h1>
      <input style={{padding:'10px', margin:'10px'}} placeholder="Choose a name" onChange={e => setName(e.target.value)} />
      <button style={{padding:'10px 20px', background:'blue', color:'white'}} onClick={handleJoin}>Request Entry</button>
    </div>
  );

  return (
    <div style={{textAlign:'center', marginTop:'100px'}}>
      {user.status === 'pending' && <h1>Waiting for Admin Approval...</h1>}
      {user.status === 'approved' && <h1>Welcome, {user.display_name}!</h1>}
      {user.status === 'kicked' && <h1 style={{color:'red'}}>You are banned.</h1>}
    </div>
  );
}
