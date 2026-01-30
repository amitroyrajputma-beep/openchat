"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const savedId = localStorage.getItem('platform_user_id');
    if (savedId) {
      supabase.from('users').select('*').eq('id', savedId).single()
        .then(({ data }) => { if(data) setUser(data); });
    }
  }, []);

  const handleJoin = async () => {
    if(!name) return alert("Enter a name");
    const { data, error } = await supabase.from('users').insert([{ display_name: name }]).select().single();
    if (error) return alert("That name is taken! Try another.");
    localStorage.setItem('platform_user_id', data.id);
    setUser(data);
  };

  if (!user) return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'100px'}}>
      <h1>Join the Platform</h1>
      <input style={{padding:'10px', border:'1px solid #ccc'}} placeholder="Choose a name" onChange={e => setName(e.target.value)} />
      <button style={{marginTop:'10px', padding:'10px 20px', background:'blue', color:'white'}} onClick={handleJoin}>Join</button>
    </div>
  );

  return (
    <div style={{textAlign:'center', marginTop:'50px'}}>
      {user.status === 'pending' && <h2>Waiting for Admin Approval...</h2>}
      {user.status === 'approved' && <h2>Welcome to the Room, {user.display_name}!</h2>}
      {user.status === 'kicked' && <h2 style={{color:'red'}}>You have been banned.</h2>}
    </div>
  );
}
