import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, Container, FormControl, 
  InputLabel, MenuItem, Rating, Select, TextField, Typography, 
  Checkbox, FormControlLabel, Grid, Avatar, Divider,
  useTheme, useMediaQuery, IconButton
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { 
  FiSend, 
  FiImage, 
  FiCheckCircle, 
  FiArrowLeft,
  FiHelpCircle,
  FiAlertCircle,
  FiThumbsUp
} from 'react-icons/fi';

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.success.main, 
            width: 80, 
            height: 80,
            mb: 2
          }}>
            <FiCheckCircle size={40} />
          </Avatar>
          <Typography variant="h4" gutterBottom>Thank You!</Typography>
          <Typography color="textSecondary" paragraph sx={{ maxWidth: 500 }}>
            Your feedback has been submitted successfully. We appreciate you helping us improve the platform.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setSubmitSuccess(false)}
            startIcon={<FiArrowLeft />}
            sx={{ mt: 2 }}
          >
            Submit Another Feedback
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 3 : 4 }}>
      <Card sx={{ 
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        boxShadow: theme.shadows[3]
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.main 
            }}>
              <FiThumbsUp />
            </Avatar>
            <Box>
              <Typography variant="h5">Share Your Feedback</Typography>
              <Typography variant="body2" color="textSecondary">
                Help us improve your experience
              </Typography>
            </Box>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography component="legend" variant="subtitle1" gutterBottom>
                    How would you rate your experience?
                  </Typography>
                  <Rating
                    name="rating"
                    value={feedback.rating}
                    size={isMobile ? 'large' : 'medium'}
                    onChange={(_, newValue) => {
                      setFeedback(prev => ({ ...prev, rating: newValue || 0 }));
                    }}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiRating-iconHover': {
                        color: theme.palette.primary.dark,
                      },
                    }}
                  />
                  {feedback.rating > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      {feedback.rating} star{feedback.rating !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    name="type"
                    value={feedback.type}
                    label="Feedback Type"
                    onChange={(e) => setFeedback(prev => ({ 
                      ...prev, 
                      type: e.target.value
                    }))}
                  >
                    <MenuItem value="bug">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiAlertCircle color={theme.palette.error.main} /> Bug Report
                      </Box>
                    </MenuItem>
                    <MenuItem value="feature">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiHelpCircle color={theme.palette.info.main} /> Feature Request
                      </Box>
                    </MenuItem>
                    <MenuItem value="general">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiThumbsUp color={theme.palette.success.main} /> General Feedback
                      </Box>
                    </MenuItem>
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
                  label={`Your ${feedback.type === 'bug' ? 'Bug Report' : 
                    feedback.type === 'feature' ? 'Feature Request' : 'Feedback'}`}
                  name="comment"
                  multiline
                  rows={4}
                  value={feedback.comment}
                  onChange={handleInputChange}
                  required
                  placeholder={
                    feedback.type === 'bug' ? 'Please describe the bug and how to reproduce it...' :
                    feedback.type === 'feature' ? 'Tell us about the feature you would like to see...' :
                    'Share your thoughts with us...'
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="requiresFollowUp"
                      checked={feedback.requiresFollowUp}
                      onChange={(e) => setFeedback(prev => ({ 
                        ...prev, 
                        requiresFollowUp: e.target.checked 
                      }))}
                      color="primary"
                    />
                  }
                  label="I'd like to receive a follow-up about this feedback"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  size="large"
                  startIcon={<FiSend />}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary" align="center">
          We review all feedback and use it to improve our platform.
        </Typography>
      </Box>
    </Container>
  );
};

export default FeedbackPage;