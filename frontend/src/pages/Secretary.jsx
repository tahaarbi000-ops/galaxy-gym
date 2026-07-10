import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Avatar, Chip, TableContainer, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { secretaries as initialSecretaries } from '../data/mockData';
import { Axios } from '../Api/Api';

const statusColor = {
  actif: { bg: 'rgba(62,213,152,0.15)', color: '#3ED598' },
  congé: { bg: 'rgba(245,184,93,0.15)', color: '#F5B85D' },
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Le nom est requis'),
  shift: Yup.string().trim().required('Le créneau est requis'),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\s]{6,15}$/, 'Numéro invalide')
    .required('Le numéro de téléphone est requis'),
  email: Yup.string().trim().email('Email invalide').required("L'email est requis"),
  password: Yup.string().required('Le mot de passe est requis'),
  status: Yup.string().oneOf(['actif', 'congé']).required('Le statut est requis'),
});

export default function Secretary() {
  const [secretaries, setSecretaries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // holds the secretary being deleted

  useEffect(()=>{
    const secretariesData = async ()=>{
      try{ 
        const response = await Axios.get("/user/secretary");
        setSecretaries(response.data.users)
      }catch{
        console.error("error")
      }
    }
    secretariesData()
  },[open])

  const formik = useFormik({
    initialValues: {
      name: '',
      shift: '',
      phone: '',
      email: '',
      password: '',
      status: 'actif',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editingId) {
        setSecretaries((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...values } : s))
        );
      } else {
        try{
            setError(false)
            await Axios.post("/user/secretary",values)
        }catch{
            setError(true)
        }
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

  const handleOpenEdit = (secretary) => {
    setEditingId(secretary.id);
    formik.setValues({
      name: secretary.name,
      shift: secretary.shift,
      phone: secretary.phone,
      email: secretary.email,
      status: secretary.status,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleOpenDelete = (secretary) => {
    setDeleteTarget(secretary);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    setSecretaries((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Secrétariat</Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez l'équipe d'accueil et administrative de votre salle
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenAdd}>
          Ajouter une secrétaire
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Créneau</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secretaries && secretaries.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700 }}>
                        {s.name[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.shift}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{s.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      size="small"
                      sx={{ bgcolor: statusColor[s.status].bg, color: statusColor[s.status].color, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => handleOpenEdit(s)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleOpenDelete(s)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingId ? 'Modifier la secrétaire' : 'Nouvelle secrétaire'}
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
                label="Créneau"
                placeholder="ex: 8h - 16h"
                value={formik.values.shift}
                name="shift"
                onChange={formik.handleChange}
                error={formik.touched.shift && Boolean(formik.errors.shift)}
                helperText={formik.touched.shift && formik.errors.shift}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
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

              <TextField
                label="Email"
                type="email"
                value={formik.values.email}
                name="email"
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="mot de passe"
                type="password"
                value={formik.values.password}
                name="password"
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formik.values.status}
                  name="status"
                  label="Statut"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="congé">Congé</MenuItem>
                </Select>
                <FormHelperText>{formik.touched.status && formik.errors.status}</FormHelperText>
              </FormControl>
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

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Supprimer la secrétaire
          <IconButton size="small" onClick={handleCloseDelete}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {deleteTarget?.name}
            </Typography>{' '}
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDelete} color="inherit">Annuler</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}