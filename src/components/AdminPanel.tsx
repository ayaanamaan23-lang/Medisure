import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only allow specific admin email
    if (!user || user.email !== 'ayaanamaan23@gmail.com') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);

        // Fetch waitlist
        const waitlistSnapshot = await getDocs(collection(db, 'waitlist'));
        const waitlistData = waitlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWaitlist(waitlistData);

        // Fetch subscriptions
        const subsQuery = query(collection(db, 'subscriptions'), orderBy('timestamp', 'desc'));
        const subsSnapshot = await getDocs(subsQuery);
        const subsData = subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscriptions(subsData);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleApproveSubscription = async (subId: string, uid: string) => {
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
      
      await updateDoc(doc(db, 'subscriptions', subId), { status: 'active' });
      await updateDoc(doc(db, 'users', uid), { 
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate.toISOString()
      });
      // Update local state
      setSubscriptions(subs => subs.map(s => s.id === subId ? { ...s, status: 'active' } : s));
      setUsers(usr => usr.map(u => u.id === uid ? { ...u, subscriptionStatus: 'active', subscriptionExpiry: expiryDate.toISOString() } : u));
    } catch (error) {
      console.error("Error approving subscription:", error);
    }
  };

  const handleRejectSubscription = async (subId: string, uid: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { status: 'rejected' });
      await updateDoc(doc(db, 'users', uid), { 
        subscriptionStatus: 'free',
        subscriptionExpiry: null
      });
      setSubscriptions(subs => subs.map(s => s.id === subId ? { ...s, status: 'rejected' } : s));
      setUsers(usr => usr.map(u => u.id === uid ? { ...u, subscriptionStatus: 'free', subscriptionExpiry: null } : u));
    } catch (error) {
      console.error("Error rejecting subscription:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const todayScans = users.reduce((acc, curr) => {
    const isToday = new Date().toISOString().split('T')[0] === curr.lastScanDate;
    return acc + (isToday ? (curr.scansToday || 0) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-6">
      <header className="mb-8">
        <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium">Waitlist Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{waitlist.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium">Scans Today</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{todayScans}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Subscriptions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {subscriptions.filter(s => s.status === 'pending').map((sub) => (
                <li key={sub.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Payment Name: {sub.paymentName}</p>
                    <p className="text-sm text-gray-500">Email: {sub.email}</p>
                    <p className="text-xs text-gray-400">Time: {new Date(sub.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveSubscription(sub.id, sub.uid)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectSubscription(sub.id, sub.uid)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
              {subscriptions.filter(s => s.status === 'pending').length === 0 && (
                <li className="p-4 text-gray-500 text-center">No pending subscriptions.</li>
              )}
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Subscriptions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {subscriptions.filter(s => s.status !== 'pending').slice(0, 10).map((sub) => (
                <li key={sub.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Payment Name: {sub.paymentName}</p>
                    <p className="text-sm text-gray-500">Email: {sub.email}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Doctor Waitlist</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {waitlist.map((entry) => (
                <li key={entry.id} className="p-4">
                  <p className="text-gray-900 font-medium">{entry.email}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                </li>
              ))}
              {waitlist.length === 0 && (
                <li className="p-4 text-gray-500 text-center">Waitlist is empty.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
