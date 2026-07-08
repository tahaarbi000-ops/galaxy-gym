import { useState } from 'react';
import {
  Box, Typography, Card, Stack, TextField, InputAdornment, Button, Chip,
  Avatar, MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { members as initialMembers } from '../data/mockData';

const statusColor = {
  Actif: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  Inactif: { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
  Suspendu: { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' },
};

const planColor = {
  Standard: '#5AA9E6',
  Premium: '#D4AF37',
  VIP: '#8E7CC3',
};

export default function Members() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');

  const filtered = initialMembers.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || m.category === filter;
    return matchSearch && matchFilter;
  });

  const columns = [
    {
      field: 'name', headerName: 'Membre', flex: 1.4, minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700, width: 34, height: 34, fontSize: 14 }}>
            {params.value[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'phone', headerName: 'Téléphone', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Catégorie', flex: 0.9, minWidth: 130 },
    {
      field: 'plan', headerName: 'Abonnement', flex: 0.8, minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: `${planColor[params.value]}22`, color: planColor[params.value], fontWeight: 700 }}
        />
      ),
    },
    { field: 'joined', headerName: "Date d'inscription", flex: 0.9, minWidth: 140 },
    {
      field: 'status', headerName: 'Statut', flex: 0.8, minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: statusColor[params.value].bg, color: statusColor[params.value].color, fontWeight: 700 }}
        />
      ),
    },
  ];

  const categories = ['Tous', ...new Set(initialMembers.map((m) => m.category))];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Membres</Typography>
          <Typography variant="body2" color="text.secondary">
            {initialMembers.length} membres enregistrés dans votre salle
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />}>Ajouter un membre</Button>
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
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(212,175,55,0.15)' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(212,175,55,0.08)' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(212,175,55,0.15)' },
              '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(212,175,55,0.04)' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
}
