import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Stack, Chip, Button, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Snackbar, Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Axios } from '../Api/Api';

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Le nom est requis'),
  category_id: Yup.string().required('Veuillez sélectionner une spécialité'),
  experience: Yup.string().trim().required("L'expérience est requise"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\s]{6,15}$/, 'Numéro invalide')
    .required('Le numéro de téléphone est requis'),
});

const emptyValues = {
  name: '',
  category_id: '',
  experience: '',
  phone: '',
};

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [category, setCategory] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const [resTrainer, resCategory] = await Promise.all([
        Axios.get('/user/trainer'),
        Axios.get('/category'),
      ]);
      setTrainers(resTrainer.data.users);
      setCategory(resCategory.data.categories);
    } catch {
      console.error('error fetching trainers/categories');
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
          await Axios.put(`/user/trainer/${editingId}`, values);
          setToast({ open: true, message: 'Entraîneur mis à jour avec succès.', severity: 'success' });
        } else {
          await Axios.post('/user/trainer', values);
          setToast({ open: true, message: 'Nouvel entraîneur ajouté avec succès.', severity: 'success' });
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

  const handleOpenEdit = (trainer) => {
    setEditingId(trainer.id);
    formik.resetForm({
      values: {
        name: trainer.name || '',
        category_id: trainer.category?.id || trainer.category_id || '',
        experience: trainer.experience || '',
        phone: trainer.phone || '',
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    formik.resetForm({ values: emptyValues });
  };

  const handleOpenDelete = (trainer) => {
    setDeleteTarget(trainer);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await Axios.delete(`/user/trainer/${deleteTarget.id}`);
      setToast({ open: true, message: 'Entraîneur supprimé avec succès.', severity: 'success' });
      await fetchData();
    } catch (err) {
      setToast({
        open: true,
        message:
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'Une erreur est survenue',
        severity: 'error',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Stack 
      style={{justifyContent:"space-between"}}
      direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Entraîneurs</Typography>
          <Typography variant="body2" color="text.secondary">
            {trainers.length} coachs professionnels dans votre équipe
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenAdd}>
          Ajouter un entraîneur
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {trainers.map((t) => (
          <Grid item xs={12} sm={6} lg={4} key={t.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack style={{alignItems:"center", justifyContent:"space-between"}} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Stack style={{alignItems:"center"}} direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 60, height: 60, fontSize: 22, fontWeight: 700,
                        background: 'linear-gradient(135deg,#F1D57A,#D4AF37 60%,#A8862B)',
                        color: '#0B0B0F',
                      }}
                    >
                      {t.name.replace('Coach ', '')[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{t.name}</Typography>
                      <Chip
                        label={t.categoryTrainer?.name || 'Non assigné'}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>
                  <IconButton size="small" onClick={() => handleOpenDelete(t)}>
                    <DeleteRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkspacePremiumRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Expérience: </Typography>
                    </Stack>
                    <Typography sx={{marginLeft:0.5}} variant="body2" fontWeight={600}>{t.experience}</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack style={{justifyContent:"space-between",alignItems:"center"}} direction="row" alignItems="center" justifyContent="space-between">
                  <Stack sx={{ marginRight:1}}  direction="row" alignItems="center" spacing={1}>
                    <PhoneRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{t.phone}</Typography>
                  </Stack>
                  <Button size="small" variant="outlined" onClick={() => handleOpenEdit(t)}>
                    Profil
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingId ? "Modifier l'entraîneur" : 'Nouvel entraîneur'}
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
              />

              <FormControl fullWidth error={formik.touched.category_id && Boolean(formik.errors.category_id)}>
                <InputLabel>Spécialité</InputLabel>
                <Select
                  value={formik.values.category_id}
                  name="category_id"
                  label="Spécialité"
                  onChange={formik.handleChange}
                  startAdornment={
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <WorkspacePremiumRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  }
                >
                  {category.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formik.touched.category_id && formik.errors.category_id}</FormHelperText>
              </FormControl>

              <TextField
                label="Expérience"
                placeholder="ex: 5 ans"
                value={formik.values.experience}
                name="experience"
                onChange={formik.handleChange}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && formik.errors.experience}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
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

      <Dialog open={Boolean(deleteTarget)} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Supprimer l'entraîneur
          <IconButton size="small" onClick={handleCloseDelete}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir supprimer{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {deleteTarget?.name}
            </Typography>{' '}
            ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDelete} color="inherit">Annuler</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">Supprimer</Button>
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