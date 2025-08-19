import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Alert, Button } from '@mui/material';
import { CancelSubscriptionButton } from '../../components/Subscription/CancelSubscriptionButton';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [renewsAt, setRenewsAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Fetch subscription status from Firestore with real-time updates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      try {
        if (doc.exists()) {
          const userData = doc.data();
          const status = userData?.subscriptionStatus?.toLowerCase() || 'inactive';
          
          // Log subscription data for debugging
          console.log('Subscription data updated:', {
            status,
            isSubscribed: userData?.isSubscribed,
            renewsAt: userData?.renewsAt?.toDate(),
            willCancelAtPeriodEnd: userData?.willCancelAtPeriodEnd,
            subscriptionEndsAt: userData?.subscriptionEndsAt
          });
          
          setSubscriptionStatus(status);
          setRenewsAt(userData?.renewsAt?.toDate());
        }
      } catch (error) {
        console.error('Error processing subscription update:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error setting up subscription listener:', error);
      setLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Refresh subscription status after cancellation
  const handleSubscriptionCancelled = () => {
    // Force a refresh of the page to update the UI
    window.location.reload();
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subscription Management
        </Typography>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Current Plan
          </Typography>
          {loading ? (
            <Typography variant="body1">Loading subscription information...</Typography>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                Status: <strong style={{ 
                  color: subscriptionStatus === 'cancelled' ? 'orange' : 
                         subscriptionStatus === 'active' ? 'green' : 'inherit'
                }}>
                  {subscriptionStatus ? subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1) : 'Inactive'}
                </strong>
                {subscriptionStatus === 'cancelled' && renewsAt && (
                  <Typography variant="body2" color="text.secondary">
                    Your access will continue until: {renewsAt.toLocaleDateString()}
                  </Typography>
                )}
              </Typography>
              {renewsAt && subscriptionStatus !== 'cancelled' && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  Next billing date: {renewsAt.toLocaleDateString()}
                </Typography>
              )}
              {subscriptionStatus === 'cancelled' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your subscription will remain active until the end of your billing period.
                </Alert>
              )}
            </>
          )}
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cancel Subscription
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              If you cancel, you'll keep your access until the end of your current billing period.
            </Typography>
            {subscriptionStatus !== 'cancelled' ? (
              <CancelSubscriptionButton onCancelled={handleSubscriptionCancelled} />
            ) : (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your subscription has been cancelled. You'll keep access until the end of your billing period.
              </Alert>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
