import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { format, subMonths, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Link,
  Chip,
  Tooltip,
} from '@mui/material';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PLATFORM = 'Other';
const MONTHS_TO_SHOW = 4; // For compact view - shows last 4 months

function PlatformTrendsTable({ compact = true }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processIncomes = useCallback((incomes) => {
    const monthPlatformTotals = {};
    const platformColors = {};
    const platformSet = new Set();

    // Track original platform casing for display
    const platformDisplayNames = {};
    
    // Process each income record
    incomes.forEach((income) => {
      try {
        const date = income?.date ? parseISO(income.date) : new Date();
        const month = format(date, 'MMM yyyy');
        
        // Get the display name from displayPlatform or platform field
        const platformDisplay = income?.displayPlatform || 
                              (income?.platform ? 
                                (income.platform.charAt(0).toUpperCase() + income.platform.slice(1).toLowerCase()) : 
                                DEFAULT_PLATFORM);
        
        // Use lowercase for grouping to ensure case-insensitive matching
        const platformKey = platformDisplay.toLowerCase();

        if (!monthPlatformTotals[month]) {
          monthPlatformTotals[month] = {};
        }

        monthPlatformTotals[month][platformKey] = 
          (monthPlatformTotals[month][platformKey] || 0) + (income.amount || 0);
        
        // Store the display name with original casing
        platformDisplayNames[platformKey] = platformDisplay;
        platformSet.add(platformKey);
        
        if (!platformColors[platformKey]) {
          platformColors[platformKey] = generatePlatformColor(platformKey);
        }
      } catch (err) {
        console.error('Error processing income:', err);
      }
    });

    // Sort platforms alphabetically by display name
    const platforms = Array.from(platformSet).sort((a, b) => 
      (platformDisplayNames[a] || a).localeCompare(platformDisplayNames[b] || b)
    );
    
    const months = Object.keys(monthPlatformTotals)
      .sort((a, b) => new Date(a) - new Date(b));

    // Limit months in compact view
    const displayMonths = compact 
      ? months.slice(-MONTHS_TO_SHOW)
      : months;

    // Generate table rows
    const rows = displayMonths.map(month => {
      const row = { month, total: 0, platforms: {} };
      let monthTotal = 0;

      platforms.forEach(platformKey => {
        const amount = monthPlatformTotals[month]?.[platformKey] || 0;
        row.platforms[platformKey] = amount;
        monthTotal += amount;
      });

      row.total = monthTotal;
      return row;
    });

    return { platforms, rows, platformColors, platformDisplayNames };
  }, [compact]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'incomes'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const incomeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncomes(incomeData);
          } catch (err) {
            console.error('Error processing snapshot:', err);
            setError('Failed to process income data');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Firestore error:', err);
          setError('Failed to load income data');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up subscription:', err);
      setError('Failed to initialize data loading');
      setLoading(false);
    }
  }, [currentUser, processIncomes]);

  const handleViewFullReport = () => {
    navigate('/platform-trends');
  };

  // Process the incomes data
  const { platforms, rows, platformColors, platformDisplayNames } = useMemo(() => {
    const processed = processIncomes(incomes);
    // Ensure all display names have proper capitalization
    Object.keys(processed.platformDisplayNames).forEach(key => {
      const name = processed.platformDisplayNames[key];
      if (name && name.length > 0) {
        processed.platformDisplayNames[key] = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      }
    });
    return processed;
  }, [incomes, processIncomes]);

  const formatCurrency = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : '-';
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (incomes.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography>No income data available. Add some income records to see trends.</Typography>
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          <FiTrendingUp style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Platform Trends
        </Typography>
        {compact && (
          <Link 
            component="button" 
            variant="body2"
            onClick={handleViewFullReport}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            View Full Report <FiExternalLink style={{ marginLeft: 4 }} />
          </Link>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              {platforms.map((platformKey) => {
                const displayName = platformDisplayNames[platformKey] || platformKey;
                return (
                  <TableCell key={platformKey} align="center">
                    <Tooltip title={displayName}>
                      <Chip 
                        label={displayName.length > 10 ? `${displayName.substring(0, 8)}...` : displayName}
                        size="small"
                        sx={{ 
                          bgcolor: `${platformColors[platformKey]}22`, 
                          border: `1px solid ${platformColors[platformKey]}`,
                          maxWidth: 100,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                );
              })}
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell component="th" scope="row">
                  {row.month}
                </TableCell>
                {platforms.map(platform => (
                  <TableCell key={platform} align="right">
                    {formatCurrency(row.platforms[platform] || 0)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${row.total.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// Helper function to generate consistent colors for platforms
function generatePlatformColor(platform) {
  const colors = [
    '#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0',
    '#2196f3', '#ff5722', '#009688', '#673ab7', '#ffc107'
  ];
  const index = platform.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export default React.memo(PlatformTrendsTable);