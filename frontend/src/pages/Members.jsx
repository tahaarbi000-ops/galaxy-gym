import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, TextField, InputAdornment, Button, Chip,
  Avatar, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  FormControl, InputLabel, Select, FormHelperText, Menu, ListItemIcon, ListItemText,
  Snackbar, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Axios } from '../Api/Api';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = Yup.object({
  name: Yup.string().required('Le nom est obligatoire'),
  phone: Yup.string()
    .matches(/^[0-9]{8}$/, 'Le numéro doit contenir 8 chiffres')
    .required('Le numéro est obligatoire'),
  category_id: Yup.string().required('Veuillez sélectionner une catégorie'),
});

const statusColor = {
  actif: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  inactif: { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
  suspendu: { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' },
};

const statusOptions = ['actif', 'inactif', 'suspendu'];

const emptyValues = {
  name: '',
  phone: '',
  category_id: '',
};

export default function Members() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [resUser, resCategory] = await Promise.all([
        Axios.get('/user/member'),
        Axios.get('/category'),
      ]);
      setUsers(resUser.data.users);
      setCategory(resCategory.data.categories);
    } catch {
      console.error('error fetching members/categories');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingId) {
          await Axios.put(`/user/member/${editingId}`, values);
          setToast({ open: true, message: 'Membre mis à jour avec succès.', severity: 'success' });
        } else {
          await Axios.post('/user/member', values);
          setToast({ open: true, message: 'Nouveau membre ajouté avec succès.', severity: 'success' });
        }

        await fetchData();
        resetForm({ values: emptyValues });
        setOpen(false);
        setEditingId(null);
      } catch (err) {
        setToast({
          open: true,
          message:
            err?.response?.data?.message ||
            err?.response?.data?.errors?.[0] ||
            'Une erreur est survenue',
          severity: 'error',
        });
      }
    },
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    formik.resetForm({ values: emptyValues });
    setOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member.id);
    formik.resetForm({
      values: {
        name: member.name || '',
        phone: member.phone || '',
        category_id: member.category?.id || member.category_id || '',
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    formik.resetForm({ values: emptyValues });
  };

  // --- status menu ---
  const handleOpenStatusMenu = (e, member) => {
    setStatusMenuAnchor(e.currentTarget);
    setStatusTarget(member);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
    setStatusTarget(null);
  };

  const handleChangeStatus = async (newStatus) => {
    const memberId = statusTarget.id;
    const previousStatus = statusTarget.status;
    handleCloseStatusMenu();

    // optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === memberId ? { ...u, status: newStatus } : u))
    );

    try {
      await Axios.patch(`/user/member/${memberId}/status`, { status: newStatus });
      setToast({ open: true, message: 'Statut mis à jour.', severity: 'success' });
    } catch (err) {
      // revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === memberId ? { ...u, status: previousStatus } : u))
      );
      setToast({
        open: true,
        message: err?.response?.data?.message || 'Impossible de mettre à jour le statut.',
        severity: 'error',
      });
    }
  };

  const filtered = users && users.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || m?.category?.name === filter;
    return matchSearch && matchFilter;
  });

  const columns = [
    { field: 'name', headerName: 'Membre', flex: 1 },
    { field: 'phone', headerName: 'Téléphone', flex: 1, minWidth: 150 },
    {
      field: 'category', headerName: 'Catégorie', flex: 0.9, minWidth: 130,
      valueGetter: (value, row) => row.category?.name || '',
    },
    {
      field: 'createdAt', headerName: "Date d'inscription", flex: 0.9, minWidth: 140,
      valueFormatter: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      field: 'status', headerName: 'Statut', flex: 0.8, minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ textTransform: 'capitalize', bgcolor: statusColor[params.value]?.bg, color: statusColor[params.value]?.color, fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.6,
      minWidth: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleOpenStatusMenu(e, params.row)}>
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const categories = ['Tous', ...new Set(category.map((c) => c.name))];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
      style={{justifyContent:"space-between"}}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>Membres</Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} membres enregistrés dans votre salle
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleOpenAdd} startIcon={<AddRoundedIcon />}>
          Ajouter un membre
        </Button>
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
            onRowDoubleClick={(params) => handleOpenEdit(params.row)}
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

      {/* Status change menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleCloseStatusMenu}
      >
        {statusOptions.map((s) => (
          <MenuItem
            key={s}
            onClick={() => handleChangeStatus(s)}
            disabled={statusTarget?.status === s}
          >
            <ListItemIcon>
              <CircleRoundedIcon fontSize="small" sx={{ color: statusColor[s].color }} />
            </ListItemIcon>
            <ListItemText sx={{ textTransform: 'capitalize' }}>{s}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Add / Edit dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingId ? 'Modifier le membre' : 'Nouveau membre'}
            <IconButton size="small" onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <TextField
                label="Nom et prénom"
                value={formik.values.name}
                name="name"
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Numéro de téléphone"
                type="text"
                value={formik.values.phone}
                name="phone"
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth error={formik.touched.category_id && Boolean(formik.errors.category_id)}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={formik.values.category_id}
                  name="category_id"
                  label="Catégorie"
                  onChange={formik.handleChange}
                >
                  {category.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} - {c.price} DT/mois
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formik.touched.category_id && formik.errors.category_id}</FormHelperText>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} color="inherit">Annuler</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
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