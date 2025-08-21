import { useState, useCallback, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  const abortControllerRef = useRef(null);
  
  // Cleanup function to abort any pending requests when component unmounts
  useEffect(() => {
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  const getSubscriptionData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      throw err;
    }
  }, [auth, db]);

  const cancelSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if subscription is already cancelled
      const subData = await getSubscriptionData();
      if (subData?.subscriptionStatus === 'cancelled') {
        throw new Error('Subscription is already cancelled');
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      
      // Optimistically update Firestore. The UI will update via the onSnapshot listener.
      await updateDoc(doc(db, 'users', user.uid), {
        subscriptionStatus: 'cancelled',
        willCancelAtPeriodEnd: true,
        subscriptionEndsAt: data.endsAt || null,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Subscription cancelled successfully');
      return data;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const subData = await getSubscriptionData();
      if (!subData?.subscriptionId) {
        throw new Error('No active subscription found');
      }

      const idToken = await user.getIdToken();
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`${API_URL}/api/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subscriptionId: subData.subscriptionId
        }),
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      // Update local state optimistically
      await updateDoc(doc(db, 'users', user.uid), {
        subscriptionStatus: 'active',
        willCancelAtPeriodEnd: false,
        subscriptionEndsAt: null,
        updatedAt: new Date().toISOString()
      });

      toast.success('Subscription reactivated successfully');
      return data;
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to reactivate subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    cancelSubscription, 
    reactivateSubscription,
    getSubscriptionData,
    isLoading, 
    error 
  };
}
