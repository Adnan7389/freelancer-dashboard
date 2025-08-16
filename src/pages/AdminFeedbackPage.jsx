import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Box, Card, CardContent, Container, Typography, 
  Rating, Chip, CircularProgress, Divider, Grid,
  FormControl, InputLabel, Select, MenuItem,
  Avatar, Button, IconButton, Badge, Tooltip, Paper,
  useTheme 
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { 
  FiFilter, 
  FiRefreshCw, 
  FiMail, 
  FiCheckCircle,
  FiAlertCircle,
  FiThumbsUp,
  FiArchive,
  FiStar,
  FiUser
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' }
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'bug', label: 'Bug Reports' },
  { value: 'feature', label: 'Feature Requests' },
  { value: 'general', label: 'General Feedback' }
];

export default function AdminFeedbackPage() {
  const theme = useTheme(); 
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser } = useAuth();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // First, get all feedback ordered by creation date
      let q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      // Process and filter the data on the client side
      let feedbackData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Skip if doesn't match type filter
        if (filter !== 'all' && data.type !== filter) return;
        // Skip if doesn't match status filter
        if (statusFilter !== 'all' && data.status !== statusFilter) return;
        
        feedbackData.push({
          id: doc.id,
          ...data,
          formattedDate: data.createdAt?.toDate 
            ? format(data.createdAt.toDate(), 'MMM d, yyyy - h:mm a')
            : 'Date not available'
        });
      });
      
      setFeedbackList(feedbackData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'feedback', id), { status: newStatus });
      toast.success(`Feedback marked as ${newStatus}`);
      fetchFeedback();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
      bug: { color: 'error', icon: <FiAlertCircle /> },
      feature: { color: 'primary', icon: <FiThumbsUp /> },
      general: { color: 'default', icon: <FiStar /> }
    };
    return configs[type] || configs.general;
  };

  const getStatusConfig = (status) => {
    const configs = {
      new: { color: 'info', label: 'New' },
      reviewed: { color: 'warning', label: 'Reviewed' },
      resolved: { color: 'success', label: 'Resolved' },
      archived: { color: 'default', label: 'Archived' }
    };
    return configs[status] || configs.new;
  };

  if (loading && feedbackList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <FiStar />
            </Avatar>
            <Typography variant="h4" fontWeight={600}>Feedback Management</Typography>
            <Badge 
              badgeContent={feedbackList.length} 
              color="primary" 
              sx={{ ml: 2 }}
            />
          </Box>
          <Tooltip title="Refresh feedback">
            <IconButton onClick={fetchFeedback} disabled={loading}>
              <FiRefreshCw />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 300 } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Feedback Type</InputLabel>
              <Select
                value={filter}
                label="Feedback Type"
                onChange={(e) => setFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 300 } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
      {feedbackList.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FiStar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">
              No feedback found matching your criteria
            </Typography>
            <Button 
              variant="text" 
              onClick={() => { 
                setFilter('all'); 
                setStatusFilter('all'); 
              }}
              sx={{ mt: 2 }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {feedbackList.map((item) => {
            const typeConfig = getTypeConfig(item.type);
            const statusConfig = getStatusConfig(item.status);
            const borderColor = typeConfig.color === 'default' ? 
              theme.palette.grey[400] : 
              theme.palette[typeConfig.color].main;
            
            return (
              <Box key={item.id} sx={{ width: '100%' }}>
                <Card 
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid ${borderColor}`
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.200' }}>
                            {item.email ? <FiUser /> : 'A'}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {item.email || 'Anonymous User'}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Chip 
                            icon={typeConfig.icon}
                            label={item.type} 
                            color={typeConfig.color}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.formattedDate}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Rating 
                          value={item.rating} 
                          readOnly 
                          size="small"
                        />
                        <Box display="flex" gap={1}>
                          {item.requiresFollowUp && (
                            <Chip 
                              label="Follow Up" 
                              color="warning" 
                              size="small"
                            />
                          )}
                          <Chip 
                            label={statusConfig.label} 
                            color={statusConfig.color}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                      {item.comment}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={1}>
                        <Tooltip title="Contact user">
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<FiMail />}
                            disabled={!item.email}
                          >
                            Contact
                          </Button>
                        </Tooltip>
                        <Tooltip title="Mark as resolved">
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<FiCheckCircle />}
                            onClick={() => handleStatusChange(item.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </Tooltip>
                        <Tooltip title="Archive feedback">
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<FiArchive />}
                            onClick={() => handleStatusChange(item.id, 'archived')}
                          >
                            Archive
                          </Button>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ID: {item.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
}