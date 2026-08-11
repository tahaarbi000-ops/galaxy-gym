import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Axios } from "../Api/Api";

const GOLD = "#D4AF37";

// Formats bytes into a readable French label (Ko, Mo, Go)
const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusChip = ({ status }) => {
  const map = {
    success: { label: "Réussie", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
    error: { label: "Échouée", color: "error", icon: <ErrorIcon fontSize="small" /> },
    running: { label: "En cours", color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  };
  const config = map[status] || map.success;
  return (
    <Chip
      size="small"
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default function BackupPage() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        Axios.get("/backup/status"),
        Axios.get("/backup/history"),
      ]);
      setStatus(statusRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      showToast("Erreur lors du chargement des informations de sauvegarde.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunNow = async () => {
    setRunningBackup(true);
    try {
      await Axios.post("/backup/run-now");
      showToast("Sauvegarde lancée avec succès.");
      await fetchData();
    } catch (err) {
        console.log(err)
      showToast("La sauvegarde a échoué. Veuillez réessayer.", "error");
    } finally {
      setRunningBackup(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
          Sauvegardes
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchData} sx={{ color: GOLD }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={runningBackup ? <CircularProgress size={18} sx={{ color: "#1a1a1a" }} /> : <BackupIcon />}
            onClick={handleRunNow}
            disabled={runningBackup}
            sx={{
              backgroundColor: GOLD,
              color: "#1a1a1a",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#c19d2e" },
              "&.Mui-disabled": { backgroundColor: "rgba(212,175,55,0.4)" },
            }}
          >
            {runningBackup ? "Sauvegarde en cours..." : "Lancer une sauvegarde"}
          </Button>
        </Stack>
      </Stack>

      {/* Status overview cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#1e1e1e",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <ScheduleIcon sx={{ color: GOLD }} fontSize="small" />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Dernière sauvegarde
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            {formatDateTime(status?.lastBackupAt)}
          </Typography>
          {status?.lastBackupStatus && (
            <Box sx={{ mt: 1 }}>
              <StatusChip status={status.lastBackupStatus} />
            </Box>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#1e1e1e",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <StorageIcon sx={{ color: GOLD }} fontSize="small" />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Sauvegarde locale
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            {status?.localCount ?? 0} fichier(s)
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            {formatSize(status?.localTotalSize)} · conservées : {status?.retentionCount ?? 30}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: "#1e1e1e",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            {status?.googleDriveConnected ? (
              <CloudDoneIcon sx={{ color: "#4caf50" }} fontSize="small" />
            ) : (
              <CloudOffIcon sx={{ color: "#f44336" }} fontSize="small" />
            )}
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Google Drive
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            {status?.googleDriveConnected ? "Connecté" : "Non connecté"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            {status?.googleDriveConnected
              ? `Dernier envoi : ${formatDateTime(status?.lastDriveUploadAt)}`
              : "Authentification requise"}
          </Typography>
        </Paper>
      </Box>

      {/* History table */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#1e1e1e",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600 }}>
            Historique des sauvegardes
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(212,175,55,0.15)" }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: GOLD, fontWeight: 600, borderColor: "rgba(212,175,55,0.15)" }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: GOLD, fontWeight: 600, borderColor: "rgba(212,175,55,0.15)" }}>
                  Taille
                </TableCell>
                <TableCell sx={{ color: GOLD, fontWeight: 600, borderColor: "rgba(212,175,55,0.15)" }}>
                  Emplacement
                </TableCell>
                <TableCell sx={{ color: GOLD, fontWeight: 600, borderColor: "rgba(212,175,55,0.15)" }}>
                  Statut
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ color: "rgba(255,255,255,0.5)", py: 4, borderColor: "rgba(212,175,55,0.1)" }}
                  >
                    Aucune sauvegarde enregistrée pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ color: "#fff", borderColor: "rgba(212,175,55,0.1)" }}>
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: "#fff", borderColor: "rgba(212,175,55,0.1)" }}>
                      {formatSize(entry.size)}
                    </TableCell>
                    <TableCell sx={{ borderColor: "rgba(212,175,55,0.1)" }}>
                      <Stack direction="row" spacing={0.5}>
                        <Chip size="small" label="Local" variant="outlined" sx={{ color: "#fff" }} />
                        {entry.uploadedToDrive && (
                          <Chip
                            size="small"
                            label="Google Drive"
                            variant="outlined"
                            sx={{ color: "#4caf50", borderColor: "#4caf50" }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ borderColor: "rgba(212,175,55,0.1)" }}>
                      <StatusChip status={entry.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}