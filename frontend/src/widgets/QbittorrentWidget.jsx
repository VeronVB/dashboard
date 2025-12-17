import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Delete as DeleteIcon,
  Refresh,
  CloudDownload,
  CloudDone,
  PauseCircleOutline,
} from '@mui/icons-material';
import {
  deleteQbittorrent,
  getQbittorrentList,
  pauseQbittorrent,
  resumeQbittorrent,
} from '../services/api';

// Pomocnicze formatowanie
const formatSpeed = (value) => {
  if (!value) return '0 B/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let speed = value;
  let idx = 0;
  while (speed >= 1024 && idx < units.length - 1) {
    speed /= 1024;
    idx += 1;
  }
  return `${speed.toFixed(1)} ${units[idx]}`;
};

const formatEta = (eta) => {
  if (eta === 0 || eta === undefined) return '—';
  if (eta < 0) return '∞';
  const hours = Math.floor(eta / 3600);
  const minutes = Math.floor((eta % 3600) / 60);
  const seconds = eta % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const getStatusMeta = (state) => {
  const normalized = (state || '').toLowerCase();
  if (normalized.includes('paused')) {
    return { label: 'Pauza', color: 'warning.main', icon: <PauseCircleOutline fontSize="small" /> };
  }
  if (normalized.includes('stalleddl') || normalized.includes('downloading')) {
    return { label: 'Pobieranie', color: 'info.main', icon: <CloudDownload fontSize="small" /> };
  }
  if (normalized.includes('uploading') || normalized.includes('stalledup') || normalized.includes('seeding')) {
    return { label: 'Seed', color: 'success.main', icon: <CloudDone fontSize="small" /> };
  }
  return { label: state || 'Nieznany', color: 'text.secondary', icon: <CloudDownload fontSize="small" /> };
};

function QbittorrentWidget({ widget }) {
  const { config } = widget;
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const refreshSeconds = useMemo(() => Math.max(5, config.refreshInterval || 20), [config.refreshInterval]);

  // Wspólny payload konfiguracyjny dla backendu proxy
  const buildPayload = useCallback(
    () => ({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    }),
    [config.host, config.password, config.port, config.username]
  );

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const payload = buildPayload();
      const response = await getQbittorrentList(payload);
      setTorrents(response.data || []);
    } catch (err) {
      console.error('Błąd pobierania listy torrentów', err);
      setError('qBittorrent nie odpowiada lub błędne dane logowania');
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshSeconds * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshSeconds]);

  const handleAction = async (action, torrent) => {
    const hash = torrent.hash;
    if (!hash) return;

    if (action === 'delete') {
      // Potwierdzenie usunięcia
      const shouldDelete = window.confirm(`Usunąć torrent "${torrent.name}"?`);
      if (!shouldDelete) return;
    }

    setActionLoading(hash);
    try {
      const payload = { ...buildPayload(), hashes: hash };
      if (action === 'pause') await pauseQbittorrent(payload);
      if (action === 'resume') await resumeQbittorrent(payload);
      if (action === 'delete') await deleteQbittorrent({ ...payload, deleteFiles: false });
      setTimeout(fetchData, 700);
    } catch (err) {
      console.error('Błąd akcji torrentu', err);
      setError('Operacja nie powiodła się');
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (torrent) => {
    const isPaused = (torrent.state || '').toLowerCase().includes('paused');
    const busy = actionLoading === torrent.hash;
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {busy ? (
          <CircularProgress size={18} />
        ) : (
          <>
            {!isPaused && (
              <Tooltip title="Zatrzymaj">
                <IconButton size="small" color="warning" onClick={() => handleAction('pause', torrent)}>
                  <Stop fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {isPaused && (
              <Tooltip title="Start">
                <IconButton size="small" color="success" onClick={() => handleAction('resume', torrent)}>
                  <PlayArrow fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Usuń">
              <IconButton size="small" color="error" onClick={() => handleAction('delete', torrent)}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  };

  const renderTableView = () => (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Box sx={{ height: 320, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell width={110}>Postęp</TableCell>
              <TableCell width={100}>Prędkość</TableCell>
              <TableCell width={90}>ETA</TableCell>
              <TableCell width={90}>Stan</TableCell>
              <TableCell width={110} align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {torrents.map((torrent) => {
              const progress = Math.round((torrent.progress || 0) * 100);
              const statusMeta = getStatusMeta(torrent.state);
              return (
                <TableRow key={torrent.hash} hover>
                  <TableCell>
                    <Typography variant="body2" noWrap title={torrent.name}>
                      {torrent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(torrent.size / (1024 ** 3)).toFixed(2)} GB
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 1 }} />
                      <Typography variant="caption" color="text.secondary">{progress}%</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">↓ {formatSpeed(torrent.dlspeed)}</Typography>
                    <Typography variant="caption" color="text.secondary">↑ {formatSpeed(torrent.upspeed)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatEta(torrent.eta)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {statusMeta.icon}
                      <Typography variant="body2" color={statusMeta.color}>{statusMeta.label}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{renderActions(torrent)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );

  const renderCardView = () => (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Box sx={{ height: 320, overflowY: 'auto', pr: 0.5 }}>
        <Grid container spacing={1}>
          {torrents.map((torrent) => {
            const progress = Math.round((torrent.progress || 0) * 100);
            const statusMeta = getStatusMeta(torrent.state);
            return (
              <Grid item xs={12} key={torrent.hash}>
                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap title={torrent.name}>
                          {torrent.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(torrent.size / (1024 ** 3)).toFixed(2)} GB • ETA {formatEta(torrent.eta)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {statusMeta.icon}
                        <Typography variant="body2" color={statusMeta.color}>{statusMeta.label}</Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <LinearProgress value={progress} variant="determinate" sx={{ height: 8, borderRadius: 1 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">Postęp: {progress}%</Typography>
                        <Typography variant="caption" color="text.secondary">↓ {formatSpeed(torrent.dlspeed)} | ↑ {formatSpeed(torrent.upspeed)}</Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      {renderActions(torrent)}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );

  if (loading && torrents.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error && torrents.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Alert severity="error" sx={{ py: 0.5 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', overflow: 'hidden' }}>
      {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          {config.name || 'qBittorrent'} • {torrents.length} elementów
        </Typography>
        <Tooltip title="Odśwież">
          <IconButton size="small" onClick={fetchData}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {torrents.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Brak torrentów do wyświetlenia</Typography>
        </Box>
      ) : config.viewMode === 'cards' ? (
        renderCardView()
      ) : (
        renderTableView()
      )}
    </Box>
  );
}

export default QbittorrentWidget;
