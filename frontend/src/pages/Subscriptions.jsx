import { useState } from 'react';
import {
  Box, Typography, Card, Stack, Button, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, TextField,
  InputAdornment, MenuItem, Snackbar, Alert,
} from '@mui/material';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { subscribers as initialSubscribers } from '../data/mockData';

const statusColor = {
  Payé: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  'Non payé': { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' },
  'En retard': { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
};

const planPrice = { Standard: 90, Premium: 150, VIP: 250 };

// Enrichit les abonnés avec un statut de paiement + historique simulé
const buildMembers = () =>
  initialSubscribers.map((s, i) => ({
    ...s,
    amount: planPrice[s.plan] || 100,
    paymentStatus: i % 3 === 0 ? 'Non payé' : i % 5 === 0 ? 'En retard' : 'Payé',
    history: [
      { id: 1, date: '2024-04-05', amount: planPrice[s.plan] || 100, method: 'Espèces' },
      { id: 2, date: '2024-05-05', amount: planPrice[s.plan] || 100, method: 'Carte bancaire' },
      { id: 3, date: '2024-06-05', amount: planPrice[s.plan] || 100, method: 'Virement' },
    ],
  }));

export default function Subscriptions() {
  const [members, setMembers] = useState(buildMembers());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || m.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  const handlePay = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              paymentStatus: 'Payé',
              history: [{ id: Date.now(), date: today, amount: m.amount, method: 'Espèces' }, ...m.history],
            }
          : m
      )
    );
    setToast({ open: true, message: 'Paiement enregistré avec succès.', severity: 'success' });
  };

  const handleOpenHistory = (member) => {
    setSelectedMember(member);
    setHistoryOpen(true);
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
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700 }}>
                        {m.name[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{m.plan}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{m.amount} DT</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{m.end}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.paymentStatus}
                      size="small"
                      sx={{ bgcolor: statusColor[m.paymentStatus].bg, color: statusColor[m.paymentStatus].color, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PaidRoundedIcon fontSize="small" />}
                        disabled={m.paymentStatus === 'Payé'}
                        onClick={() => handlePay(m.id)}
                      >
                        Payer
                      </Button>
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', border: '1px solid rgba(212,175,55,0.2)' }}
                        onClick={() => handleOpenHistory(m)}
                      >
                        <HistoryRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">Aucun membre trouvé.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialogue historique des paiements */}
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
          <List>
            {selectedMember?.history.map((h, i) => (
              <Box key={h.id}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${h.amount} DT — ${h.method}`}
                    secondary={h.date}
                  />
                </ListItem>
                {i < selectedMember.history.length - 1 && <Divider component="li" />}
              </Box>
            ))}
            {(!selectedMember || selectedMember.history.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Aucun paiement enregistré.
              </Typography>
            )}
          </List>
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