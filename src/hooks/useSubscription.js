import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || ''; // The /api is now part of the route

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

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

  return { cancelSubscription, isLoading, error };
}
