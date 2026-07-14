import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  IconButton, Alert, Stack,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import * as Yup from "yup"
import { useFormik } from 'formik';
import axios from 'axios';
import Logo from "../assets/images/logo.png"

const validationSchema = Yup.object().shape({
  email: Yup.string().required("email est obligatoire").matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email invalide"),
  password: Yup.string().required("mot de passe est obligatoire")
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
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        setError("")
        const response = await axios.post("http://localhost:5000/api/v1/auth/login", values)
        const token = response.data.token;
        window.localStorage.setItem("auth", token)
        window.location.reload()

      } catch {
        setError('Veuillez renseigner votre email et votre mot de passe.');

      } finally {
        setLoading(false)
      }
    }
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            component="img"
            src={Logo}
            alt="Galaxy Gym Elfaouar"
            sx={{
              width: 84,
              height: 84,
              objectFit: 'contain',
            }}
          />
        </Box>
        <Box sx={{display:"flex",alignItems:"center",flexDirection:"column"}}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Bon retour
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Connectez-vous à votre espace administrateur Galaxy Gym Elfaouar
        </Typography>
        </Box>

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

          <Button type="submit" loading={loading} variant="contained" size="large" fullWidth sx={{ py: 1.4, fontSize: 16 }}>
            Se connecter
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}