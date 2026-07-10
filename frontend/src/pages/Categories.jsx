import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Button, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  InputAdornment, Snackbar, Alert,
  Paper,
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
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { categories as initialCategories } from '../data/mockData';
import * as Yup from "yup";
import { useFormik } from 'formik';
import { Axios } from '../Api/Api';

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Le nom de la catégorie est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  price: Yup.number()
    .typeError("Le prix doit être un nombre")
    .required("Le prix mensuel est obligatoire")
    .positive("Le prix doit être supérieur à 0")
    .max(10000, "Le prix est trop élevé"),

  icon: Yup.string()
    .required("Veuillez sélectionner une icône"),
});

const iconMap = [
  {label:"Fitness Center",value:"FitnessCenter",icon: FitnessCenterRoundedIcon},
  {label:"Sports Mma",value:"SportsMma" ,icon:SportsMmaRoundedIcon},
  {label:"Sports Gymnastics",value:"SportsGymnastics", icon:SportsGymnasticsRoundedIcon},
  {label:"Self Improvement",value:"SelfImprovement", icon:SelfImprovementRoundedIcon},
  {label:"Directions Run",value:"DirectionsRun",icon: DirectionsRunRoundedIcon},
  {label:"Pool",value:"Pool", icon:PoolRoundedIcon},
];

const colorOptions = ['#D4AF37', '#EF5A6F', '#5AA9E6', '#3ED598', '#F5B85D', '#8E7CC3'];

const emptyForm = {
  name: '',
  price: '',
  members: 0,
  trainers: 0,
  icon: 'FitnessCenter',
  color: '#D4AF37',
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(()=>{
    const CategoryData = async ()=>{
      try{
        const response = await Axios.get("/category")
        setCategories(response.data.categories)
      }catch{

      }
    }
    CategoryData()
  },[open])

  const formik = useFormik({
    initialValues:{
      name:"",
      price:"",
      icon:"",
    },
    validationSchema,
    onSubmit: async (values) => {
      try{
        setErrors(false)
        await Axios.post("/category",values);
        setOpen(false)
      }catch{
        setErrors(true)
      }
    }
  })

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      price: c.price,
      members: c.members,
      trainers: c.trainers,
      icon: c.icon,
      color: c.color,
    });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Prix invalide';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, ...form, price: Number(form.price), members: Number(form.members), trainers: Number(form.trainers) }
            : c
        )
      );
      setToast({ open: true, message: 'Catégorie mise à jour avec succès.', severity: 'success' });
    } else {
      const newCategory = {
        id: Date.now(),
        ...form,
        price: Number(form.price),
        members: Number(form.members) || 0,
        trainers: Number(form.trainers) || 0,
      };
      setCategories((prev) => [...prev, newCategory]);
      setToast({ open: true, message: 'Nouvelle catégorie ajoutée avec succès.', severity: 'success' });
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setToast({ open: true, message: 'Catégorie supprimée.', severity: 'info' });
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
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
        {categories.map((c,index) => {
          const Icon =
              iconMap.find((item) => item.value === c.icon)?.icon ||
              FitnessCenterRoundedIcon;
            const color = colorOptions[index % colorOptions.length];
          return (
            <Grid item xs={12} sm={6} lg={4} key={c.id}>
              <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                    borderRadius: '50%', bgcolor: `${color}14`,
                  }}
                />
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box
                      sx={{
                        width: 56, height: 56, borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${color}22`, color: color, mb: 2,
                      }}
                    >
                      <Icon fontSize="medium" />
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => handleOpenEdit(c)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDelete(c.id)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>{c.name}</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.4}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: c.color }}>
                        {c.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">DT/mois</Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GroupRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{c.members} membres</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BadgeRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{c.trainers} coach(s)</Typography>
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
    <DialogTitle
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
    >
      {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}

      <IconButton size="small" onClick={handleClose}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>
      <Stack spacing={2.5} sx={{ mt: 0.5 }}>
        <TextField
          fullWidth
          autoFocus
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
                <PaidRoundedIcon
                  fontSize="small"
                  sx={{ color: "primary.main" }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                DT / mois
              </InputAdornment>
            ),
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
            <Stack direction="row" spacing={1} alignItems="center">
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
      <Button onClick={handleClose} color="inherit">
        Annuler
      </Button>

      <Button  type="submit" variant="contained">
        {editingId ? "Enregistrer" : "Ajouter"}
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
