import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Box, Card, CardContent, Container, Typography, 
  Rating, Chip, CircularProgress, Grid, Divider, 
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackRef = collection(db, 'feedback');
        const q = query(feedbackRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const feedbackData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setFeedbackList(feedbackData);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = feedbackList.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'bug': return 'error';
      case 'feature': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">User Feedback</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filter}
            label="Filter by Type"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Feedback</MenuItem>
            <MenuItem value="bug">Bug Reports</MenuItem>
            <MenuItem value="feature">Feature Requests</MenuItem>
            <MenuItem value="general">General Feedback</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary">
              No feedback found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredFeedback.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" component="div">
                        {item.email || 'Anonymous User'}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1} mb={2}>
                        <Chip 
                          label={item.type} 
                          color={getTypeColor(item.type)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {item.createdAt?.toDate ? 
                            new Date(item.createdAt.toDate()).toLocaleString() : 
                            'Date not available'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Rating value={item.rating} readOnly />
                      {item.requiresFollowUp && (
                        <Chip 
                          label="Follow Up Requested" 
                          color="warning" 
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {item.comment}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      User ID: {item.userId || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {item.status || 'new'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
