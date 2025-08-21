import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useSubscription } from '../../hooks/useSubscription';

export function CancelSubscriptionButton({ onCancelled, onReactivated, subscriptionStatus }) {
  const [open, setOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(subscriptionStatus === 'cancelled');
  const { 
    cancelSubscription, 
    reactivateSubscription, 
    isLoading, 
    error 
  } = useSubscription();

  // Update local state when subscription status changes
  useEffect(() => {
    setIsCancelled(subscriptionStatus === 'cancelled');
  }, [subscriptionStatus]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => !isLoading && setOpen(false);

  const handleConfirm = async () => {
    try {
      if (isCancelled) {
        await reactivateSubscription();
        setIsCancelled(false);
        if (onReactivated) onReactivated();
      } else {
        await cancelSubscription();
        setIsCancelled(true);
        if (onCancelled) onCancelled();
      }
      handleClose();
    } catch (error) {
      // Error is handled by the hook
      console.error('Error in handleConfirm:', error);
    }
  };

  const buttonText = isCancelled 
    ? 'Reactivate Subscription' 
    : 'Cancel Subscription';

  const dialogTitle = isCancelled 
    ? 'Reactivate Subscription' 
    : 'Cancel Subscription';

  const dialogContent = isCancelled ? (
    <DialogContent>
      <DialogContentText>
        Reactivating your subscription will restore full access to all Pro features. 
        Your billing cycle will continue from today.
      </DialogContentText>
    </DialogContent>
  ) : (
    <DialogContent>
      <DialogContentText>
        Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.
      </DialogContentText>
    </DialogContent>
  );

  const confirmButtonText = isCancelled 
    ? (isLoading ? 'Reactivating...' : 'Yes, Reactivate')
    : (isLoading ? 'Cancelling...' : 'Yes, Cancel');

  return (
    <Box sx={{ mt: 2 }}>
      <Button 
        variant={isCancelled ? "contained" : "outlined"}
        color={isCancelled ? "primary" : "error"}
        onClick={handleOpen}
        disabled={isLoading}
        fullWidth
        sx={{ 
          py: 1.5,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            Processing...
          </Box>
        ) : buttonText}
      </Button>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogContent}
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={isLoading}
            variant="outlined"
          >
            {isCancelled ? 'Not Now' : 'Keep Subscription'}
          </Button>
          <Button 
            onClick={handleConfirm} 
            color={isCancelled ? "primary" : "error"}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CancelSubscriptionButton;
