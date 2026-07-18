import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Button, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  InputAdornment, Snackbar, Alert, Chip, Switch, Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import SportsMmaRoundedIcon from '@mui/icons-material/SportsMmaRounded';
import SportsGymnasticsRoundedIcon from '@mui/icons-material/SportsGymnasticsRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import PoolRoundedIcon from '@mui/icons-material/PoolRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Axios } from '../Api/Api';

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Le nom de la catégorie est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  price: Yup.number()
    .typeError('Le prix doit être un nombre')
    .required('Le prix mensuel est obligatoire')
    .positive('Le prix doit être supérieur à 0')
    .max(10000, 'Le prix est trop élevé'),

  icon: Yup.string().required('Veuillez sélectionner une icône'),
});

const iconMap = [
  { label: 'Fitness Center', value: 'FitnessCenter', icon: FitnessCenterRoundedIcon },
  { label: 'Sports Mma', value: 'SportsMma', icon: SportsMmaRoundedIcon },
  { label: 'Sports Gymnastics', value: 'SportsGymnastics', icon: SportsGymnasticsRoundedIcon },
  { label: 'Self Improvement', value: 'SelfImprovement', icon: SelfImprovementRoundedIcon },
  { label: 'Directions Run', value: 'DirectionsRun', icon: DirectionsRunRoundedIcon },
  { label: 'Pool', value: 'Pool', icon: PoolRoundedIcon },
];

const colorOptions = ['#D4AF37', '#EF5A6F', '#5AA9E6', '#3ED598', '#F5B85D', '#8E7CC3'];

const emptyValues = { name: '', price: '', icon: '' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [disableTarget, setDisableTarget] = useState(null); // category being disabled (confirmation)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchCategories = async () => {
    try {
      const response = await Axios.get('/category');
      setCategories(response.data.categories);
    } catch {
      console.error('error fetching categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values, price: Number(values.price) };

        if (editingId) {
          await Axios.put(`/category/${editingId}`, payload);
          setToast({ open: true, message: 'Catégorie mise à jour avec succès.', severity: 'success' });
        } else {
          await Axios.post('/category', payload);
          setToast({ open: true, message: 'Nouvelle catégorie ajoutée avec succès.', severity: 'success' });
        }

        await fetchCategories();
        resetForm();
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

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    formik.resetForm({
      values: {
        name: c.name || '',
        price: c.price ?? '',
        icon: c.icon || '',
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    formik.resetForm({ values: emptyValues });
  };

  // Disabling a category needs confirmation (hides it from active use elsewhere)
  // Disabling a category needs confirmation (hides it from active use elsewhere)
const handleOpenDisable = (c) => setDisableTarget(c);
const handleCloseDisable = () => setDisableTarget(null);

const handleConfirmDisable = async () => {
  const target = disableTarget;
  setDisableTarget(null);

  // optimistic update
  setCategories((prev) =>
    prev.map((c) => (c.id === target.id ? { ...c, status: 'inactive' } : c))
  );

  try {
    await Axios.put(`/category/${target.id}/status`, { status: 'inactive' });
    setToast({ open: true, message: `"${target.name}" a été désactivée.`, severity: 'info' });
  } catch (err) {
    // revert on failure
    setCategories((prev) =>
      prev.map((c) => (c.id === target.id ? { ...c, status: 'active' } : c))
    );
    setToast({
      open: true,
      message: err?.response?.data?.message || 'Impossible de désactiver cette catégorie.',
      severity: 'error',
    });
  }
};

const handleEnable = async (c) => {
  setCategories((prev) =>
    prev.map((item) => (item.id === c.id ? { ...item, status: 'active' } : item))
  );

  try {
    await Axios.put(`/category/${c.id}/status`, { status: 'active' });
    setToast({ open: true, message: `"${c.name}" a été réactivée.`, severity: 'success' });
  } catch (err) {
    setCategories((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, status: 'inactive' } : item))
    );
    setToast({
      open: true,
      message: err?.response?.data?.message || 'Impossible de réactiver cette catégorie.',
      severity: 'error',
    });
  }
};

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Catégories</Typography>
          <Typography variant="body2" color="text.secondary">
            Les disciplines proposées au sein de Galaxy Gym Elfaouar
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenAdd}>
          Nouvelle catégorie
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {categories.map((c, index) => {
          const Icon = iconMap.find((item) => item.value === c.icon)?.icon || FitnessCenterRoundedIcon;
          const color = colorOptions[index % colorOptions.length];
          const isActive = c.active !== false; // treat undefined as active for backward compatibility

          return (
            <Grid item xs={12} sm={6} lg={4} key={c.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isActive ? 1 : 0.55,
                  filter: isActive ? 'none' : 'grayscale(40%)',
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                    borderRadius: '50%', bgcolor: `${color}14`,
                  }}
                />
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Stack style={{ justifyContent:"space-between",alignItems:"flex-start"}} direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box
                      sx={{
                        width: 56, height: 56, borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${color}22`, color: color, mb: 2,
                      }}
                    >
                      <Icon fontSize="medium" />
                    </Box>
                    <Stack style={{alignItems:"center"}} direction="row" spacing={0.5} alignItems="center">
                      {!isActive && (
                        <Chip label="Désactivée" size="small" color="default" sx={{ mr: 0.5 }} />
                      )}
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => handleOpenEdit(c)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <Tooltip title={isActive ? 'Désactiver' : 'Réactiver'}>
                        <Switch
                          size="small"
                          checked={isActive}
                          onChange={() => (isActive ? handleOpenDisable(c) : handleEnable(c))}
                        />
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Stack style={{justifyContent:"space-between",alignItems:"center"}} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{c.name}</Typography>
                    <Stack style={{alignItems:"baseline"}} direction="row" alignItems="baseline" spacing={0.4}>
                      <Typography variant="h6" fontWeight={800} sx={{ color }}>
                        {c.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">DT/mois</Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack style={{justifyContent:"space-between"}} direction="row" justifyContent="space-between">
                    <Stack style={{alignItems:"center"}} direction="row" alignItems="center" spacing={1} sx={{ mr: 1 }}>
                      <GroupRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{c.membersCount ?? 0} membres</Typography>
                    </Stack>
                    <Stack style={{alignItems:"center"}} direction="row" alignItems="center" spacing={1}>
                      <BadgeRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{c.trainersCount ?? 0} coach(s)</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialogue Ajouter / Modifier une catégorie */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            <IconButton size="small" onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <TextField
                fullWidth
                label="Nom de la catégorie"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />

              <TextField
                fullWidth
                label="Prix mensuel"
                type="number"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaidRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">DT / mois</InputAdornment>,
                }}
              />

              <TextField
                select
                fullWidth
                label="Icône"
                name="icon"
                value={formik.values.icon}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.icon && Boolean(formik.errors.icon)}
                helperText={formik.touched.icon && formik.errors.icon}
              >
                {iconMap.map((opt, i) => {
                  const OptIcon = opt.icon;
                  return (
                    <MenuItem key={i} value={opt.value}>
                      <Stack style={{alignItems:"center"}} direction="row" spacing={1} alignItems="center">
                        <OptIcon fontSize="small" />
                        <span>{opt.label}</span>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>
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

      {/* Dialogue de désactivation (remplace la suppression) */}
      <Dialog open={Boolean(disableTarget)} onClose={handleCloseDisable} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Désactiver la catégorie
          <IconButton size="small" onClick={handleCloseDisable}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Voulez-vous désactiver{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {disableTarget?.name}
            </Typography>{' '}
            ? Elle ne sera plus proposée aux membres, mais ses données seront conservées et vous pourrez la réactiver à tout moment.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDisable} color="inherit">Annuler</Button>
          <Button onClick={handleConfirmDisable} variant="contained" color="warning" startIcon={<BlockRoundedIcon />}>
            Désactiver
          </Button>
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