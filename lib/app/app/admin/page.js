"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    const sub = supabase.channel('admin').on('postgres_changes', {event:'*', schema:'public', table:'users'}, fetchUsers).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', {ascending: false});
    setUsers(data || []);
  }

  const setStatus = async (id, status) => {
    await supabase.from('users').update({ status }).eq('id', id);
  };

  return (
    <div style={{padding:'20px'}}>
      <h1>Admin Control Panel</h1>
      <div style={{border:'1px solid #eee', marginTop:'20px'}}>
        {users.map(u => (
          <div key={u.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
            <span><strong>{u.display_name}</strong> ({u.status})</span>
            <div>
              <button onClick={() => setStatus(u.id, 'approved')} style={{background:'green', color:'white', marginRight:'5px'}}>Approve</button>
              <button onClick={() => setStatus(u.id, 'kicked')} style={{background:'red', color:'white'}}>Kick</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
