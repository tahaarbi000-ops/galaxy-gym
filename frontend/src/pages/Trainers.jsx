import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Stack, Chip, Button, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { trainers as initialTrainers } from '../data/mockData';
import { Axios } from '../Api/Api';

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Le nom est requis'),
  specialty: Yup.string().trim().required('La spécialité est requise'),
  experience: Yup.string().trim().required("L'expérience est requise"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\s]{6,15}$/, 'Numéro invalide')
    .required('Le numéro de téléphone est requis'),
});

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(()=>{
    const trainersData = async () => {
      try{
       const response = await Axios.get("/user/trainer");
       setTrainers(response.data.users)
      }catch{
        console.error("error")
      }
    }
    trainersData()
  },[open])

  const formik = useFormik({
    initialValues: {
      name: '',
      specialty: '',
      experience: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editingId) {
        setTrainers((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...values } : t))
        );
      } else {
       await Axios.post("/user/trainer",values)
      }
      resetForm();
      setOpen(false);
      setEditingId(null);
    },
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (trainer) => {
    setEditingId(trainer.id);
    formik.setValues({
      name: trainer.name,
      specialty: trainer.specialty,
      experience: trainer.experience,
      phone: trainer.phone,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
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
                <Stack direction="row" spacing={2} alignItems="center">
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
                      label={t.specialty}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 600 }}
                    />
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkspacePremiumRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Expérience: </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>{t.experience}</Typography>
                  </Stack>                
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                autoFocus
              />

              <TextField
                label="Spécialité"
                value={formik.values.specialty}
                name="specialty"
                onChange={formik.handleChange}
                error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                helperText={formik.touched.specialty && formik.errors.specialty}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkspacePremiumRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />

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
            <Button type="submit" variant="contained">
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}