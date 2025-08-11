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
  const [data, setData] = useState({ platforms: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processIncomes = useCallback((incomes) => {
    const monthPlatformTotals = {};
    const platformColors = {};
    const platformSet = new Set();

    // Process each income record
    incomes.forEach((income) => {
      try {
        const date = income?.date ? parseISO(income.date) : new Date();
        const month = format(date, 'MMM yyyy');
        const platform = income?.platform?.trim() || DEFAULT_PLATFORM;

        if (!monthPlatformTotals[month]) {
          monthPlatformTotals[month] = {};
        }

        monthPlatformTotals[month][platform] = 
          (monthPlatformTotals[month][platform] || 0) + (income.amount || 0);
        
        platformSet.add(platform);
        
        if (!platformColors[platform]) {
          platformColors[platform] = generatePlatformColor(platform);
        }
      } catch (err) {
        console.error('Error processing income:', err);
      }
    });

    const platforms = Array.from(platformSet).sort();
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

      platforms.forEach(platform => {
        const amount = monthPlatformTotals[month]?.[platform] || 0;
        row.platforms[platform] = amount;
        monthTotal += amount;
      });

      row.total = monthTotal;
      return row;
    });

    return { platforms, rows, platformColors };
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
            const incomes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const processedData = processIncomes(incomes);
            setData(processedData);
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

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const { platforms, rows, platformColors } = data;

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
              {platforms.map(platform => (
                <TableCell key={platform} align="right">
                  <Tooltip title={platform}>
                    <Chip 
                      label={platform.length > 10 ? `${platform.substring(0, 8)}...` : platform}
                      size="small"
                      sx={{ 
                        bgcolor: `${platformColors[platform]}22`, 
                        border: `1px solid ${platformColors[platform]}`,
                        maxWidth: 100
                      }}
                    />
                  </Tooltip>
                </TableCell>
              ))}
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
                    {row.platforms[platform] ? `$${row.platforms[platform].toLocaleString()}` : '-'}
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