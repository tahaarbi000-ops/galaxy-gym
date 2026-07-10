import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, TextField, InputAdornment, Button, Chip,
  Avatar, MenuItem,Dialog, DialogTitle, DialogContent, DialogActions,IconButton,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,

} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';

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


import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { members as initialMembers } from '../data/mockData';
import { Axios } from '../Api/Api';
import * as Yup from "yup";
import { useFormik } from 'formik';

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Le nom est obligatoire"),

  phone: Yup.string()
    .matches(/^[0-9]{8}$/, "Le numéro doit contenir 8 chiffres")
    .required("Le numéro est obligatoire"),

  category_id: Yup.string()
    .required("Veuillez sélectionner une catégorie"),
});

const statusColor = {
  actif: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  inactif: { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
  suspendu: { bg: 'rgba(239,90,111,0.15)', color: '#EF5A6F' },
};

const planColor = {
  Standard: '#5AA9E6',
  Premium: '#D4AF37',
  VIP: '#8E7CC3',
};
 const emptyForm = {
  name: '',
  price: '',
  members: 0,
  trainers: 0,
  icon: 'FitnessCenter',
  color: '#D4AF37',
};

const iconMap = {
  FitnessCenter: FitnessCenterRoundedIcon,
  SportsMma: SportsMmaRoundedIcon,
  SportsGymnastics: SportsGymnasticsRoundedIcon,
  SelfImprovement: SelfImprovementRoundedIcon,
  DirectionsRun: DirectionsRunRoundedIcon,
  Pool: PoolRoundedIcon,
};

const iconOptions = Object.keys(iconMap);
const colorOptions = ['#D4AF37', '#EF5A6F', '#5AA9E6', '#3ED598', '#F5B85D', '#8E7CC3'];



export default function Members() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [users, setUsers] = useState([]);
  const [open,setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [category, setCategory] = useState([]);

  useEffect(()=>{
    const data = async () => {
      try{
       const [resUser, resCategory] = await Promise.all([
          Axios.get("/user/membre"),
          Axios.get("/category"),
        ]);
        setUsers(resUser.data.users);
        setCategory(resCategory.data.categories);
      }catch{
        console.error("error")
      }
    }
    data()
  },[open])

const formik = useFormik({
  initialValues:{
    name:"",
    phone:"",
    category_id:null
  },
  validationSchema,
  onSubmit: async (values) => {
    try{
      await Axios.post("/user/member",values);
      setOpen(false)
      setToast({ open: true, message: 'Catégorie mise à jour avec succès.', severity: 'success' });

    }catch{
      console.error("error")
    }

  }
})
  


    const handleClose = () => setOpen(false);

     const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
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
  const filtered = users && users.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || m?.subscription?.categorySubscription?.name === filter;
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
    {
  field: "category", headerName: "Catégorie", flex: 0.9, minWidth: 130, valueGetter: (value, row) => row.subscription?.categorySubscription?.name || "",},
    { field: 'createdAt', headerName: "Date d'inscription", flex: 0.9, minWidth: 140,valueFormatter: (value) => {
        return new Date(value).toLocaleDateString("fr-FR");
      }, },
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


  const categories = ['Tous', ...new Set(category.map((m) => m.name))];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        
        
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingId ? 'Modifier la membre' : 'Nouvelle membre'}
          <IconButton size="small" onClick={handleClose}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Nom et pérnom"
              value={formik.values.name}
              name='name'
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              autoFocus
            />
            <TextField
              label="numéro de télèphone"
              type="text"
              value={formik.values.phone}
              name='phone'
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaidRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">DT / mois</InputAdornment>,
              }}
            />
       <FormControl fullWidth error={formik.touched.category_id && Boolean(formik.errors.category_id)}>
  <InputLabel>Catégorie</InputLabel>

  <Select
    value={formik.values.category_id}
    name='category_id'
    label="Catégorie"
    onChange={formik.handleChange}
  >
    {category.map((category) => (
      <MenuItem key={category.id} value={category.id}>
        {category.name} - {category.price} DT/mois
      </MenuItem>
    ))}
  </Select>

  <FormHelperText>{formik.touched.category_id && formik.errors.category_id}</FormHelperText>
</FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button type='submit' variant="contained">
            {editingId ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
        </form>
      </Dialog>
        
        
        
        <Box>
          <Typography variant="h4" fontWeight={800}>Membres</Typography>
          <Typography variant="body2" color="text.secondary">
            {initialMembers.length} membres enregistrés dans votre salle
          </Typography>
        </Box>
        <Button variant="contained" onClick={()=>setOpen(true)} startIcon={<AddRoundedIcon />}>Ajouter un membre</Button>
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
