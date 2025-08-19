import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useSubscription } from '../../hooks/useSubscription';

export function CancelSubscriptionButton({ onCancelled }) {
  const [open, setOpen] = React.useState(false);
  const { cancelSubscription, isLoading } = useSubscription();

  const handleOpen = () => setOpen(true);
  const handleClose = () => !isLoading && setOpen(false);

  const handleConfirm = async () => {
    try {
      await cancelSubscription();
      handleClose();
      // Call the onCancelled callback if provided
      if (onCancelled && typeof onCancelled === 'function') {
        onCancelled();
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error in handleConfirm:', error);
    }
  };

  return (
    <>
      <Button 
        variant="outlined" 
        color="error" 
        onClick={handleOpen}
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? 'Processing...' : 'Cancel Subscription'}
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            No, Keep It
          </Button>
          <Button 
            onClick={handleConfirm} 
            color="error" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CancelSubscriptionButton;
