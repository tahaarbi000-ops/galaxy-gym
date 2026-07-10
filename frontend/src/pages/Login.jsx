import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  IconButton, Checkbox, FormControlLabel, Alert, Grid, Stack,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { useAuth } from '../context/AuthContext';
import * as Yup from "yup" 
import { useFormik } from 'formik';
import axios from 'axios';
const validationSchema = Yup.object().shape({
  email:Yup.string().required("email est obligatoire").matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Email invalide"),
  password:Yup.string().required("mot de passe est obligatoire")
})

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues:{
      email:"",
      password:""
    },
    validationSchema,
    onSubmit: async (values) => {
      try{
        setLoading(true)
        setError("")
        const response = await axios.post("http://localhost:5000/api/v1/auth/login",values)
        const token = response.data.token;
        window.localStorage.setItem("auth",token)
        window.location.reload()

      }catch{
      setError('Veuillez renseigner votre email et votre mot de passe.');

      }finally{
        setLoading(false)
      }
    }
  })


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setError('');
  //   if (!email || !password) {
  //     return;
  //   }
  //   const ok = login(email, password);
    // if (ok) navigate(from, { replace: true });
  //   else setError('Identifiants invalides.');
  // };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Volet visuel */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 30% 20%, rgba(212,175,55,0.25), transparent 55%), linear-gradient(160deg, #0B0B0F 0%, #16151C 60%, #0B0B0F 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage:
              'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 1px, transparent 22px)',
          }}
        />
        <Stack spacing={3} sx={{ position: 'relative', px: 8, textAlign: 'center' }} alignItems="center">
          <Box
            sx={{
              width: 84, height: 84, borderRadius: '20px',
              background: 'linear-gradient(135deg,#F1D57A,#D4AF37 60%,#A8862B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(212,175,55,0.4)',
            }}
          >
            <FitnessCenterRoundedIcon sx={{ fontSize: 42, color: '#0B0B0F' }} />
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: 1 }}>
            Galaxy Gym
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ letterSpacing: 4 }}>
            ELFAOUAR
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 380 }}>
            L'excellence du fitness. Gérez vos membres, entraîneurs et abonnements
            depuis un espace unique, pensé pour la performance.
          </Typography>
        </Stack>
      </Grid>

      {/* Volet formulaire */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: 3, bgcolor: 'background.default',
        }}
      >
        <Paper
          component="form"
          onSubmit={formik.handleSubmit}
          elevation={0}
          sx={{
            width: '100%', maxWidth: 420, p: { xs: 3, sm: 5 }, borderRadius: 4,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '16px',
                background: 'linear-gradient(135deg,#F1D57A,#D4AF37 60%,#A8862B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FitnessCenterRoundedIcon sx={{ color: '#0B0B0F' }} />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Bon retour
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Connectez-vous à votre espace administrateur Galaxy Gym Elfaouar
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Stack spacing={2.5}>
            <TextField
              error={formik.touched.email && formik.errors.email}
              helperText={formik.touched.email && formik.errors.email}
              fullWidth
              label="Adresse email"
              type="text"
              value={formik.values.email}
              name='email'
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: 'primary.main' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              error={formik.touched.password && formik.errors.password}
              helperText={formik.touched.password && formik.errors.password}
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              name='password'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: 'primary.main' }} fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: 'primary.main' }} defaultChecked />}
                label={<Typography variant="body2" color="text.secondary">Se souvenir de moi</Typography>}
              />
              <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer' }}>
                Mot de passe oublié ?
              </Typography>
            </Box>

            <Button type="submit" loading={loading} variant="contained" size="large" fullWidth sx={{ py: 1.4, fontSize: 16 }}>
              Se connecter
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              Démo — saisissez n'importe quel email / mot de passe pour accéder au dashboard.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
