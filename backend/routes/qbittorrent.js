const express = require('express');
const axios = require('axios');

const router = express.Router();

// Buduje bazowy URL API qBittorrent
const buildBaseUrl = (host, port) => {
  const sanitizedHost = host.replace(/\/+$/, '');
  return `${sanitizedHost}:${port}/api/v2`;
};

// Logowanie i utworzenie klienta z ciasteczkiem SID
const getAuthenticatedClient = async ({ host, port, username, password }) => {
  if (!host || !port || !username || !password) {
    throw new Error('Brak wymaganej konfiguracji połączenia');
  }

  const baseUrl = buildBaseUrl(host, port);
  const loginPayload = new URLSearchParams({ username, password }).toString();

  const loginResponse = await axios.post(`${baseUrl}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 5000,
    validateStatus: () => true,
  });

  if (loginResponse.status !== 200 || loginResponse.data !== 'Ok.') {
    throw new Error('Nieudane logowanie do qBittorrent');
  }

  const cookies = loginResponse.headers['set-cookie'] || [];
  const sidCookie = cookies.find((cookie) => cookie.startsWith('SID='));

  if (!sidCookie) {
    throw new Error('Brak ciasteczka sesji SID');
  }

  return axios.create({
    baseURL: `${baseUrl}/`,
    timeout: 8000,
    headers: {
      Cookie: sidCookie,
    },
  });
};

// Wspólna obsługa błędów
const handleProxyError = (res, error, defaultMessage) => {
  console.error(defaultMessage, error.message);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || defaultMessage;
  res.status(status).json({ error: message });
};

// Pobieranie listy torrentów
router.post('/list', async (req, res) => {
  const { host, port, username, password, filter } = req.body;

  try {
    const client = await getAuthenticatedClient({ host, port, username, password });
    const params = {};
    if (filter) params.filter = filter;

    const response = await client.get('torrents/info', { params });
    res.json(response.data);
  } catch (error) {
    handleProxyError(res, error, 'Nie udało się pobrać listy torrentów');
  }
});

// Pauzowanie torrentu
router.post('/pause', async (req, res) => {
  const { host, port, username, password, hashes } = req.body;

  if (!hashes || (Array.isArray(hashes) && hashes.length === 0)) {
    return res.status(400).json({ error: 'Brak hashy torrentów do pauzy' });
  }

  try {
    const client = await getAuthenticatedClient({ host, port, username, password });
    const payload = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
    }).toString();

    await client.post('torrents/pause', payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({ success: true });
  } catch (error) {
    handleProxyError(res, error, 'Nie udało się zatrzymać torrentu');
  }
});

// Wznawianie torrentu
router.post('/resume', async (req, res) => {
  const { host, port, username, password, hashes } = req.body;

  if (!hashes || (Array.isArray(hashes) && hashes.length === 0)) {
    return res.status(400).json({ error: 'Brak hashy torrentów do wznowienia' });
  }

  try {
    const client = await getAuthenticatedClient({ host, port, username, password });
    const payload = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
    }).toString();

    await client.post('torrents/resume', payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({ success: true });
  } catch (error) {
    handleProxyError(res, error, 'Nie udało się wznowić torrentu');
  }
});

// Usuwanie torrentu
router.post('/delete', async (req, res) => {
  const { host, port, username, password, hashes, deleteFiles = false } = req.body;

  if (!hashes || (Array.isArray(hashes) && hashes.length === 0)) {
    return res.status(400).json({ error: 'Brak hashy torrentów do usunięcia' });
  }

  try {
    const client = await getAuthenticatedClient({ host, port, username, password });
    const payload = new URLSearchParams({
      hashes: Array.isArray(hashes) ? hashes.join('|') : hashes,
      deleteFiles: deleteFiles ? 'true' : 'false',
    }).toString();

    await client.post('torrents/delete', payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({ success: true });
  } catch (error) {
    handleProxyError(res, error, 'Nie udało się usunąć torrentu');
  }
});

module.exports = router;
