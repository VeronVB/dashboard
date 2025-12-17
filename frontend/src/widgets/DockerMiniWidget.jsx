import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  IconButton, 
  Tooltip,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Refresh 
} from '@mui/icons-material';
import { 
  getContainers, 
  startContainer, 
  stopContainer, 
  restartContainer 
} from '../services/api';

function DockerMiniWidget({ widget, onUpdate }) {
  const { config } = widget;
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID kontenera z trwającą akcją
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getContainers();
      let filtered = res.data || [];
      
      // Filtrowanie po endpointId
      if (config.endpointId) {
        filtered = filtered.filter(c => String(c.endpointId) === String(config.endpointId));
      }
      
      // Filtrowanie po nazwie (Regex)
      if (config.containerFilter) {
        try {
          const regex = new RegExp(config.containerFilter, 'i');
          filtered = filtered.filter(c => {
             const nameToCheck = Array.isArray(c.Names) ? c.Names[0] : c.name;
             return regex.test(nameToCheck || '');
          });
        } catch (e) { console.warn('Invalid regex', e); }
      }
      
      setContainers(filtered);
    } catch (err) {
      console.error('Error fetching containers:', err);
      setError('Błąd pobierania danych');
    } finally {
      setLoading(false);
    }
  }, [config.endpointId, config.containerFilter]);

  useEffect(() => {
    fetchData();
    const refreshSec = Math.max(5, config.refreshInterval || 30);
    const interval = setInterval(fetchData, refreshSec * 1000);
    return () => clearInterval(interval);
  }, [fetchData, config.refreshInterval]);

  const handleAction = async (action, container) => {
    const id = container.Id || container.id;
    const endpointId = config.endpointId || container.endpointId || 1;
    
    setActionLoading(id);
    try {
      if (action === 'start') await startContainer(endpointId, id);
      if (action === 'stop') await stopContainer(endpointId, id);
      if (action === 'restart') await restartContainer(endpointId, id);
      
      // Szybkie odświeżenie po akcji
      setTimeout(fetchData, 1000);
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && containers.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', overflow: 'hidden' }}>
      {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Widoczne: {containers.length}
        </Typography>
        <Tooltip title="Odśwież teraz">
          <IconButton size="small" onClick={fetchData}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        {containers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Brak kontenerów
          </Typography>
        ) : (
          containers.map(c => {
            const containerId = c.Id || c.id;
            const name = Array.isArray(c.Names) ? c.Names[0].replace('/', '') : c.name;
            const state = c.State || c.state; 
            const isRunning = state === 'running';
            const isActionBusy = actionLoading === containerId;

            return (
              <Box 
                key={containerId} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {/* Status Dot */}
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: isRunning ? 'success.main' : 'error.main',
                    flexShrink: 0
                  }}
                />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap title={name}>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {state}
                  </Typography>
                </Box>

                {config.showActions && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {isActionBusy ? (
                      <CircularProgress size={20} sx={{ m: 0.5 }} />
                    ) : (
                      <>
                        {/* 1. START (tylko gdy NIE działa) */}
                        {!isRunning && (
                          <Tooltip title="Start">
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleAction('start', c)}
                            >
                              <PlayArrow fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* 2. STOP (tylko gdy działa) */}
                        {isRunning && (
                          <Tooltip title="Zatrzymaj">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleAction('stop', c)}
                            >
                              <Stop fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* 3. RESTART (tylko gdy działa) */}
                        {isRunning && (
                          <Tooltip title="Restart">
                            <IconButton 
                              size="small" 
                              onClick={() => handleAction('restart', c)}
                            >
                              <Refresh fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

export default DockerMiniWidget;