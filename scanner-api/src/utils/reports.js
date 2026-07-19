const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const handleDownloadResponse = async (response, fallbackName) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expirée');
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const detail = err?.detail;
    const message = Array.isArray(detail) ? detail.map((e) => e.msg).join(', ') : detail || 'Échec du téléchargement';
    throw new Error(message);
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] || fallbackName;
  const blob = await response.blob();
  downloadBlob(blob, filename);
};

/** Exporte un rapport terminé (json | csv). */
export const exportReport = async (scanId, format = 'json') => {
  const response = await fetch(
    `${API_BASE_URL}/reports/${scanId}/export?format=${format}`,
    { headers: authHeaders() },
  );
  await handleDownloadResponse(response, `evapi-rapport.${format}`);
};

/** Exporte tous les rapports terminés en JSON. */
export const exportAllReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/export/all`, {
    headers: authHeaders(),
  });
  await handleDownloadResponse(response, 'evapi-rapports.json');
};

/** Télécharge le rapport PDF d'un scan. */
export const downloadReportPdf = async (scanId) => {
  const response = await fetch(`${API_BASE_URL}/files/reports/${scanId}/pdf`, {
    headers: authHeaders(),
  });
  await handleDownloadResponse(response, `evapi-rapport-${scanId.slice(0, 8)}.pdf`);
};

/** Enrichit un rapport avec Ollama (résumé + recommandations IA). */
export const enrichReportWithAi = async (scanId) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}/ai/reports/${scanId}/enrich`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === 'string' ? detail : 'Enrichissement IA échoué');
  }
  return data;
};

/** Statut Ollama. */
export const fetchAiStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/ai/status`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Impossible de joindre le service IA');
  return response.json();
};

/** Importe un rapport depuis un fichier JSON EvAPI. */
export const importReport = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/reports/import`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expirée');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail) ? detail.map((e) => e.msg).join(', ') : detail || 'Import échoué';
    throw new Error(message);
  }
  return data;
};
