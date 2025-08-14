import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, Container, FormControl, 
  InputLabel, MenuItem, Rating, Select, TextField, Typography, 
  Checkbox, FormControlLabel, Grid 
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [feedback, setFeedback] = useState({ 
    rating: 0,
    type: 'general',
    comment: '',
    email: currentUser?.email || '',
    requiresFollowUp: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.rating || !feedback.comment) {
      toast.error('Please provide a rating and comment');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...feedback,
        userId: currentUser?.uid || null,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSubmitSuccess(true);
      toast.success('Thank you for your feedback!');
      setFeedback({
        rating: 0,
        type: 'general',
        comment: '',
        email: currentUser?.email || '',
        requiresFollowUp: false,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Thank You!</Typography>
        <Typography color="textSecondary" paragraph>
          Your feedback has been submitted successfully.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setSubmitSuccess(false)}
          sx={{ mt: 2 }}
        >
          Submit Another Feedback
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Send Us Feedback</Typography>
          <Typography color="textSecondary" paragraph>
            We'd love to hear your thoughts, suggestions, or report any issues you're experiencing.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography component="legend">How would you rate your experience?</Typography>
                <Rating
                  name="rating"
                  value={feedback.rating}
                  onChange={(_, newValue) => {
                    setFeedback(prev => ({ ...prev, rating: newValue }));
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    name="type"
                    value={feedback.type}
                    label="Feedback Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="bug">Bug Report</MenuItem>
                    <MenuItem value="feature">Feature Request</MenuItem>
                    <MenuItem value="general">General Feedback</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={feedback.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Feedback"
                  name="comment"
                  multiline
                  rows={4}
                  value={feedback.comment}
                  onChange={handleInputChange}
                  required
                  placeholder="Please provide detailed feedback..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="requiresFollowUp"
                      checked={feedback.requiresFollowUp}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="I'd like to receive a follow-up"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FeedbackPage;
