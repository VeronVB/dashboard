import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon
} from '@mui/icons-material';
import { getContainers, startContainer, stopContainer, restartContainer } from '../services/api';

function Containers() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const res = await getContainers();
      setContainers(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (endpointId, containerId, name) => {
    setActionLoading({ [containerId]: 'start' });
    try {
      await startContainer(endpointId, containerId);
      toast.success(`Kontener ${name} został wystartowany`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Błąd: ${err.message}`);
    } finally {
      setActionLoading({});
    }
  };

  const handleRestart = async (endpointId, containerId, name) => {
    setActionLoading({ [containerId]: 'restart' });
    try {
      await restartContainer(endpointId, containerId);
      toast.success(`Kontener ${name} został zrestartowany`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Błąd: ${err.message}`);
    } finally {
      setActionLoading({});
    }
  };

  const handleStop = async (endpointId, containerId, name) => {
    setActionLoading({ [containerId]: 'stop' });
    try {
      await stopContainer(endpointId, containerId);
      toast.success(`Kontener ${name} został zatrzymany`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Błąd: ${err.message}`);
    } finally {
      setActionLoading({});
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return 'success';
      case 'exited': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
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

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kontenery Docker</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Endpoint</InputLabel>
            <Select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              label="Endpoint"
            >
              <MenuItem value="all">Wszystkie</MenuItem>
              {[...new Set(containers.map(c => c.endpointName))].map(name => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={fetchContainers} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell>Obraz</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {containers
              .filter(c => selectedEndpoint === 'all' || c.endpointName === selectedEndpoint)
              .map((container) => (
                <TableRow key={container.id}>
                  <TableCell>{container.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {container.image}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={container.state} 
                      color={getStateColor(container.state)}
                      size="small"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      {container.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={container.endpointName} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Start">
                      <IconButton
                        onClick={() => handleStart(container.endpointId, container.id, container.name)}
                        disabled={!!actionLoading[container.id] || container.state === 'running'}
                        color="success"
                        size="small"
                      >
                        {actionLoading[container.id] === 'start' ? (
                          <CircularProgress size={20} />
                        ) : (
                          <PlayIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Stop">
                      <IconButton
                        onClick={() => handleStop(container.endpointId, container.id, container.name)}
                        disabled={!!actionLoading[container.id] || container.state !== 'running'}
                        color="error"
                        size="small"
                      >
                        {actionLoading[container.id] === 'stop' ? (
                          <CircularProgress size={20} />
                        ) : (
                          <StopIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restart">
                      <IconButton
                        onClick={() => handleRestart(container.endpointId, container.id, container.name)}
                        disabled={!!actionLoading[container.id]}
                        color="primary"
                        size="small"
                      >
                        {actionLoading[container.id] === 'restart' ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RestartIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Containers;