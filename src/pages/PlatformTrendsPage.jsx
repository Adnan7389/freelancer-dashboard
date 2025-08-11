import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import PlatformTrendsTable from '../components/PlatformTrendsTable';

function PlatformTrendsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Platform Trends Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Detailed breakdown of your income by platform over time
        </Typography>
      </Box>
      <PlatformTrendsTable compact={false} />
    </Container>
  );
}

export default PlatformTrendsPage;