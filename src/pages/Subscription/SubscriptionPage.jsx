import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Alert, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  CardMembership as CardMembershipIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { CancelSubscriptionButton } from '../../components/Subscription/CancelSubscriptionButton';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function SubscriptionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [subscriptionData, setSubscriptionData] = useState({
    status: null,
    plan: null,
    renewsAt: null,
    endsAt: null,
    willCancelAtPeriodEnd: false,
    subscriptionId: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const unsubscribe = onSnapshot(userDocRef, 
      (doc) => {
        try {
          if (doc.exists()) {
            const userData = doc.data();
            const status = (userData?.subscriptionStatus || 'inactive').toLowerCase();
            const endsAt = userData?.subscriptionEndsAt?.toDate?.() || null;
            const renewsAt = userData?.renewsAt?.toDate?.() || null;
            
            const newData = {
              status,
              plan: userData?.plan || 'Free',
              renewsAt,
              endsAt,
              willCancelAtPeriodEnd: userData?.willCancelAtPeriodEnd || false,
              subscriptionId: userData?.subscriptionId || null,
              subscriptionUrl: userData?.subscriptionUrl || null
            };
            
            setSubscriptionData(newData);
          }
        } catch (error) {
          console.error('Error processing subscription update:', error);
          setError('Failed to load subscription data');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error setting up subscription listener:', error);
        setError('Failed to load subscription data');
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleSubscriptionCancelled = () => {
    // State is updated automatically via the real-time listener
  };

  const handleSubscriptionReactivated = () => {
    // State is updated automatically via the real-time listener
  };

  const getStatusChip = (status) => {
    const statusMap = {
      active: {
        label: 'Active',
        color: 'success',
        icon: <CheckCircleIcon fontSize="small" />
      },
      cancelled: {
        label: 'Cancelled',
        color: 'warning',
        icon: <InfoIcon fontSize="small" />
      },
      inactive: {
        label: 'Inactive',
        color: 'default',
        icon: <CancelIcon fontSize="small" />
      }
    };

    const statusInfo = statusMap[status] || statusMap.inactive;
    
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        variant="outlined"
        size="small"
        sx={{ ml: 1, fontWeight: 500 }}
      />
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSubscriptionDetails = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    const { status, plan, renewsAt, endsAt, willCancelAtPeriodEnd, subscriptionUrl } = subscriptionData;
    const isActive = status === 'active' || (status === 'cancelled' && willCancelAtPeriodEnd);
    const isCancelled = status === 'cancelled' && willCancelAtPeriodEnd;

    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h6" component="div">
                  {plan} Plan
                </Typography>
                {getStatusChip(status)}
              </Box>
              
              <Box display="flex" alignItems="center" mb={1}>
                <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {isActive && renewsAt && (
                    <span>Next billing: <strong>{formatDate(renewsAt)}</strong></span>
                  )}
                  {isCancelled && endsAt && (
                    <span>Access until: <strong>{formatDate(endsAt)}</strong></span>
                  )}
                  {!isActive && !isCancelled && (
                    <span>No active subscription</span>
                  )}
                </Typography>
              </Box>

              {subscriptionUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  href={subscriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<CardMembershipIcon />}
                  sx={{ mt: 1 }}
                >
                  Manage Subscription
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'} mt={isMobile ? 2 : 0}>
                <CancelSubscriptionButton 
                  subscriptionStatus={status}
                  onCancelled={handleSubscriptionCancelled}
                  onReactivated={handleSubscriptionReactivated}
                />
              </Box>
            </Grid>
          </Grid>

          {isCancelled && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Your subscription will remain active until the end of your billing period.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Subscription Management
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 2 : 3, 
          bgcolor: 'background.paper', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <CardMembershipIcon sx={{ mr: 1, color: 'primary.main' }} />
          Your Subscription
        </Typography>
        
        {renderSubscriptionDetails()}
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Plan Benefits
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2">Unlimited Projects</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and manage unlimited projects
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2">Advanced Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access to detailed project analytics
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2">Priority Support</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get help from our support team
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2">Early Access</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try new features before everyone else
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
