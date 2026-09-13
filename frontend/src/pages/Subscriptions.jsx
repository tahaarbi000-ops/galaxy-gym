import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, Button, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, TextField,
  InputAdornment, MenuItem, Snackbar, Alert, Tooltip, CircularProgress
} from '@mui/material';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Axios } from '../Api/Api';

const paymentTypeLabels = {
  monthly: "Mensuel",
  three_month: "Trimestriel",
  six_month: "Semestriel",
  yearly: "Annuel",
};

const statusColor = {
  payé: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  'non payé': { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' },
  'en retard': { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
};

const arrieréStyle = { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' };

const STATUS_MAP = {
  'Payé': 'payé',
  'Non payé': 'non payé',
  'En retard': 'en retard',
};

const PAGE_SIZE = 20;

const isCurrentMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export default function Subscriptions() {
  const [members, setMembers] = useState();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchSubscriptions = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const response = await Axios.get('/subscription', {
        params: {
          page: pageToFetch,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: STATUS_MAP[filter] || undefined,
        },
      });
      setMembers(response.data.subscriptions);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch {
      console.error('error');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input, reset to page 1 on search/filter change
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchSubscriptions(1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  // Fetch when page changes
  useEffect(() => {
    if (page === 1) return;
    fetchSubscriptions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePay = async (m) => {
    try {
      await Axios.post(`/subscription/pay/${m.member.id}`, {
        amount: m.amount,
        method: 'Espèces',
      });

      await fetchSubscriptions(page);

      setToast({ open: true, message: 'Paiement enregistré avec succès.', severity: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Erreur lors de l'enregistrement du paiement.", severity: 'error' });
    }
  };

  const handleOpenHistory = async (memberId, memberName) => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setSelectedMember({ name: memberName, records: [] });
    try {
      const response = await Axios.get(`/subscription/payments/${memberId}`);
      setSelectedMember({ name: memberName, records: response.data.payments });
    } catch (err) {
      console.error(err);
      setSelectedMember({ name: memberName, records: [] });
      setToast({ open: true, message: "Erreur lors du chargement de l'historique.", severity: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Abonnements</Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi des paiements de tous les membres
          </Typography>
        </Box>
      </Stack>

      <Card sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
          <TextField
            placeholder="Rechercher un membre..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { sm: 320 } }}
          />
          <TextField
            select size="small" value={filter} onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {['Tous', 'Payé', 'Non payé', 'En retard'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Membre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Formule</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Échéance</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Type de abonnement</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={22} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && members && members.map((m) => {
                const current = isCurrentMonth(m.date);
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="body2" fontWeight={600}>{m?.member?.name}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{m?.member?.category?.name}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{m.amount} DT</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{new Date(m?.next_payment_at)?.toLocaleDateString()}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {paymentTypeLabels[m?.payment_type] || m?.payment_type}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                          label={m.status}
                          size="small"
                          sx={{ bgcolor: statusColor[m.status]?.bg, color: statusColor[m.status]?.color, fontWeight: 700 }}
                        />
                        {!current && (
                          <Chip
                            label="Mois précédent"
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary', fontSize: 11 }}
                          />
                        )}
                        {m.unpaidCount > 1 && (
                          <Chip
                            label={`Arriéré — ${m.unpaidCount} mois — ${m.totalDue} DT`}
                            size="small"
                            sx={{ bgcolor: arrieréStyle.bg, color: arrieréStyle.color, fontWeight: 700, fontSize: 11 }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PaidRoundedIcon fontSize="small" />}
                          disabled={m.status === 'payé' && current}
                          onClick={() => handlePay(m)}
                        >
                          Payer
                        </Button>
                        <IconButton
                          size="small"
                          sx={{ color: 'text.secondary', border: '1px solid rgba(212,175,55,0.2)' }}
                          onClick={() => handleOpenHistory(m.member.id, m.member.name)}
                        >
                          <HistoryRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && members && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">Aucun membre trouvé.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && totalPages > 1 && (
          <Stack direction="row" spacing={1.5} style={{justifyContent:"center",alignItems:"center"}} sx={{ mt: 3 }}>
            <Button
              size="small"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Précédent
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page} / {totalPages}
            </Typography>
            <Button
              size="small"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Suivant
            </Button>
          </Stack>
        )}
      </Card>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptLongRoundedIcon sx={{ color: 'primary.main' }} />
            <span>Historique — {selectedMember?.name}</span>
          </Stack>
          <IconButton size="small" onClick={() => setHistoryOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {historyLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Chargement...
            </Typography>
          ) : (
            <List>
              {selectedMember?.records?.map((h, i) => {
                const isDuplicate =
                  selectedMember.records.filter((r) => r.subscription_id === h.subscription_id).length > 1;

                return (
                  <Box key={h.id}>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleRoundedIcon
                          fontSize="small"
                          sx={{ color: h.status === 'payé' ? 'success.main' : 'text.disabled' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>
                              {h.amount} DT —{' '}
                              {h.subscription_date
                                ? new Date(h.subscription_date).toLocaleDateString('fr-FR', {
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                            {isDuplicate && (
                              <Tooltip title="Plusieurs paiements liés au même abonnement">
                                <WarningAmberIcon fontSize="small" sx={{ color: 'warning.main' }} />
                              </Tooltip>
                            )}
                          </Stack>
                        }
                        secondary={
                          h.paid_at
                            ? `Payé le ${new Date(h.paid_at).toLocaleString('fr-FR')}`
                            : '—'
                        }
                      />
                    </ListItem>
                    {i < selectedMember.records.length - 1 && <Divider component="li" />}
                  </Box>
                );
              })}
              {(!selectedMember?.records || selectedMember.records.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Aucun paiement enregistré.
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setHistoryOpen(false)} variant="outlined" fullWidth>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}