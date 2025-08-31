import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlatformTrendsTable from '../components/PlatformTrendsTable';
import { useTheme } from '../hooks/useTheme';

function PlatformTrendsPage() {
  const { theme } = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: theme === 'dark' ? 'grey.900' : 'grey.50', minHeight: '100vh' }}>
      <Box mb={4}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          color={theme === 'dark' ? 'white' : 'text.primary'}
        >
          Platform Trends Analysis
        </Typography>
        <Typography 
          variant="subtitle1" 
          color={theme === 'dark' ? 'grey.400' : 'text.secondary'}
        >
          Detailed breakdown of your income by platform over time
        </Typography>
      </Box>
      <PlatformTrendsTable compact={false} />
    </Container>
  );
}

export default PlatformTrendsPage;