import {
  Grid, Card, CardContent, Typography, Box, Stack, Avatar, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SportsGymnasticsRoundedIcon from '@mui/icons-material/SportsGymnasticsRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import StatCard from '../components/StatCard';
import { stats, revenueByMonth, membersByCategory, members, trainers } from '../data/mockData';
import { useEffect, useState } from 'react';
import { Axios } from '../Api/Api';

const COLORS = ['#D4AF37', '#EF5A6F', '#5AA9E6', '#3ED598', '#8E7CC3'];

export default function Dashboard() {
  const [stats,setStats] = useState({});
  const [revenue,setRevenue] = useState({});
  const [membersByCategory,setMembersByCategory] = useState([]);
  const [lastMembers,setLastMembers] = useState([]);
  useEffect(()=>{
    const dashboardData = async () => {
      try{
        const [resStats,resRevenue,resMembers,resLastMembers] = await Promise.all([
          Axios.get('/dashboard/stats'),
          Axios.get('/dashboard/revenue-evolution'),
          Axios.get('/dashboard/members-by-category'),
          Axios.get('/dashboard/last-members'),
        ])
        setStats(resStats.data)
        setRevenue(resRevenue.data)
        setMembersByCategory(resMembers.data)
        setLastMembers(resLastMembers.data.result)
      }catch{
        console.error("error")
      }
    }
    dashboardData()
  },[])
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Bienvenue, Galaxy Gym Elfaouar
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Voici un aperçu général de l'activité de votre salle aujourd'hui.
      </Typography>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Membres totaux"
            value={stats?.members?.total || 0}
            icon={<GroupRoundedIcon />}
            trend={`+ ${stats?.members?.growth || 0}%`}
            trendUp
            color="#D4AF37"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Entraîneurs actifs"
            value={stats?.trainer || 0}
            icon={<SportsGymnasticsRoundedIcon />}
            trendUp
            color="#5AA9E6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Revenu mensuel"
            value={`${stats?.revenue?.thisMonth || 0} DT`}
            icon={<PaidRoundedIcon />}
            trend={`+${stats?.revenue?.growth || 0}%`}
            trendUp
            color="#3ED598"
          />
        </Grid>
        
      </Grid>

      <Box  sx={{ mt: 3 }}>
        {/* Graphique revenu */}
        <Box item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack style={{justifyContent:"space-between",alignItems:"center" }} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Évolution du revenu</Typography>
                  <Typography variant="caption" color="text.secondary">7 derniers mois</Typography>
                </Box>
                <Chip label={`+${revenue?.growth || 0}% ce mois`} size="small" sx={{ bgcolor: 'rgba(62,213,152,0.15)', color: 'success.main' }} />
              </Stack>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenue.chart}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(243,241,234,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(243,241,234,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A21', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12 }}
                    labelStyle={{ color: '#F3F1EA' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
        </Box>
        <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Répartition par catégorie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Membres par catégorie</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                 <Pie
                    data={membersByCategory}
                    dataKey="members"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                >
                    {membersByCategory.map((entry, i) => (
                        <Cell
                            key={entry.id}
                            fill={COLORS[i % COLORS.length]}
                            stroke="none"
                        />
                    ))}
                </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A21', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {membersByCategory.map((c, i) => (
    <Stack
        key={c.id}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        style={{justifyContent:"space-between",alignItems:"center" }}
    >
        <Stack style={{alignItems:"center"}} direction="row" spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: COLORS[i % COLORS.length],
                }}
            />
            <Typography variant="body2">
                {c.category}
            </Typography>
        </Stack>

        
    </Stack>
))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Derniers membres */}
        <Grid item xs={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Derniers membres inscrits</Typography>
              <Stack spacing={0.5} divider={<Divider sx={{ borderColor: 'rgba(212,175,55,0.1)' }} />}>
                {lastMembers.slice(0, 4).map((m) => (
                  <Stack
                    key={m.id}
                    direction="row"
                    alignItems="center"
                    sx={{ width: '100%', py: 1.5 }}
                  >
                    <Stack style={{alignItems:"center"}} direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: 'primary.main', fontWeight: 700 }}>
                        {m.name[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} noWrap>{m.name}</Typography>
                    </Stack>
                    <Box sx={{ flex: 1, textAlign: { xs: 'right', sm: 'center' } }}>
                      <Typography variant="body2" color="text.secondary">{m.category}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Chip
                        label={m.status}
                        size="small"
                        sx={{
                          bgcolor: m.status === 'actif' ? 'rgba(62,213,152,0.15)' : 'rgba(239,90,111,0.15)',
                          color: m.status === 'actif' ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}