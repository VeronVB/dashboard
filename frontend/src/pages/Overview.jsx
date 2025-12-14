import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { getProxmoxMetrics, getStatus } from '../services/api';

function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Odświeżaj co 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, statusRes] = await Promise.all([
        getProxmoxMetrics(),
        getStatus()
      ]);
      setMetrics(metricsRes.data);
      setStatus(statusRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Błąd: {error}</Alert>
      </Container>
    );
  }

  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Status homelaba */}
      <Box sx={{ mb: 3 }}>
        <Alert severity={status?.status === 'online' ? 'success' : 'error'}>
          Homelab: {status?.status === 'online' ? '🟢 Online' : '🔴 Offline'}
          {status?.lastUpdate && ` (${new Date(status.lastUpdate).toLocaleString('pl-PL')})`}
        </Alert>
      </Box>

      {/* Metryki */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ComputerIcon sx={{ mr: 1 }} />
                <Typography variant="h6">CPU</Typography>
              </Box>
              <Typography variant="h4">
                {(metrics?.cpu * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MemoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">RAM</Typography>
              </Box>
              <Typography variant="h4">
                {formatBytes(metrics?.memory)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Dysk</Typography>
              </Box>
              <Typography variant="h4">
                {metrics?.disk?.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimerIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Uptime</Typography>
              </Box>
              <Typography variant="h4">
                {formatUptime(metrics?.uptime)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Overview;