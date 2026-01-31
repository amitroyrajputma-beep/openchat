"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [users, setUsers] = useState([]);

  // 1. Load users and listen for new ones in real-time
  useEffect(() => {
    fetchUsers();
    
    // This part makes the list update instantly when someone joins
    const channel = supabase
      .channel('admin-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setUsers(data || []);
  }

  // 2. Function to Approve or Kick
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) alert("Error updating user");
    fetchUsers(); // Refresh the list
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Admin Control Panel</h1>
      <p>Manage access for your platform members below:</p>

      <div style={{ marginTop: '30px' }}>
        {users.length === 0 && <p>No users have tried to join yet.</p>}
        
        {users.map((u) => (
          <div key={u.id} style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            marginBottom: '10px',
            backgroundColor: u.status === 'pending' ? '#fff9e6' : '#fff'
          }}>
            <div>
              <strong style={{ fontSize: '1.2rem' }}>{u.display_name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Status: <span style={{ fontWeight: 'bold', color: u.status === 'approved' ? 'green' : 'orange' }}>
                  {u.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {u.status !== 'approved' && (
                <button 
                  onClick={() => updateStatus(u.id, 'approved')}
                  style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Approve
                </button>
              )}
              
              {u.status !== 'kicked' && (
                <button 
                  onClick={() => updateStatus(u.id, 'kicked')}
                  style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Kick / Ban
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
