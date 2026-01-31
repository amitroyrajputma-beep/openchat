"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    const sub = supabase.channel('any').on('postgres_changes', {event:'*', schema:'public', table:'users'}, fetchUsers).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', {ascending: false});
    setUsers(data || []);
  }

  const updateStatus = async (id, status) => {
    await supabase.from('users').update({ status }).eq('id', id);
    fetchUsers();
  };

  return (
    <div style={{padding:'40px', fontFamily:'sans-serif'}}>
      <h1>Admin Dashboard</h1>
      {users.map(u => (
        <div key={u.id} style={{border:'1px solid #ddd', padding:'10px', margin:'10px 0', display:'flex', justifyContent:'space-between'}}>
          <span>{u.display_name} (<strong>{u.status}</strong>)</span>
          <div>
            <button onClick={() => updateStatus(u.id, 'approved')} style={{background:'green', color:'white', marginRight:'5px'}}>Approve</button>
            <button onClick={() => updateStatus(u.id, 'kicked')} style={{background:'red', color:'white'}}>Kick</button>
          </div>
        </div>
      ))}
    </div>
  );
}
