import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Collapse,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import { IoAddCircleOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlinePaid, MdExpandMore } from "react-icons/md";
import { LuLogIn } from "react-icons/lu";
import { Axios } from '../Api/Api';

// -----------------------------------------------------------------------
// Config: action -> icon / color / label
// -----------------------------------------------------------------------
const ACTION_CONFIG = {
  create: { icon: IoAddCircleOutline, color: '#4CAF50', label: 'Ajout' },
  update: { icon: FiEdit, color: '#D4AF37', label: 'Modification' },
  delete: { icon: RiDeleteBinLine, color: '#E53935', label: 'Suppression' },
  pay: { icon: MdOutlinePaid, color: '#D4AF37', label: 'Paiement' },
  login: { icon: LuLogIn, color: '#9E9E9E', label: 'Connexion' },
};

// Must match the lowercase entity_type values your API actually returns
const ENTITY_TYPES = ['member', 'trainer', 'category', 'subscription', 'user'];
const ENTITY_LABELS = {
  member: 'Membre',
  trainer: 'Formateur',
  category: 'Catégorie',
  subscription: 'Abonnement',
  user: 'Secrétariat',
};

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function formatRelative(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByDay(logs) {
  const groups = {};
  logs.forEach((log) => {
    const d = new Date(log.createdAt); // fixed: backend sends createdAt, not created_at
    const key = d.toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

function dayLabel(dateKey) {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// -----------------------------------------------------------------------
// Entry row
// -----------------------------------------------------------------------
function ActivityEntry({ log }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.update;
  const Icon = config.icon;
  const hasDiff = log.old_values || log.new_values;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, position: 'relative', pb: 2.5 }}>
      {/* Timeline rail */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${config.color}22`,
            border: `1px solid ${config.color}66`,
            flexShrink: 0,
          }}
        >
          <Icon style={{ fontSize: 17, color: config.color }} />
        </Box>
        <Box sx={{ flex: 1, width: '1px', bgcolor: 'rgba(255,255,255,0.08)', mt: 0.5 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" style={{justifyContent:"space-between",alignItems:"flex-start",gap:1}}>
          <Typography sx={{ color: '#EDEDED', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {log.description}
          </Typography>
          <Typography
            title={formatFull(log.createdAt)}
            sx={{ color: '#8A8A8A', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0, mt: 0.2 }}
          >
            {formatRelative(log.createdAt)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} style={{alignItems:"center"}}>
          <Chip
            label={log.user_role === 'admin' ? 'Admin' : 'Secrétariat'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              bgcolor: 'rgba(212,175,55,0.1)',
              color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.25)',
            }}
          />
          {log.entity_type && (
            <Chip
              label={ENTITY_LABELS[log.entity_type] || log.entity_type}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(255,255,255,0.06)',
                color: '#BDBDBD',
              }}
            />
          )}
          {hasDiff && (
            <IconButton
              size="small"
              onClick={() => setExpanded((e) => !e)}
              sx={{ p: 0.25, color: '#8A8A8A' }}
            >
              <MdExpandMore
                style={{
                  fontSize: 18,
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }}
              />
            </IconButton>
          )}
        </Stack>

        {hasDiff && (
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 1,
                p: 1.25,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.78rem',
              }}
            >
              {log.old_values && (
                <Box sx={{ mb: log.new_values ? 0.75 : 0 }}>
                  <Typography sx={{ color: '#E5736B', fontSize: '0.7rem', mb: 0.25 }}>
                    Avant
                  </Typography>
                  <Typography component="pre" sx={{ color: '#B0B0B0', m: 0, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {JSON.stringify(log.old_values, null, 2)}
                  </Typography>
                </Box>
              )}
              {log.new_values && (
                <Box>
                  <Typography sx={{ color: '#7FC97F', fontSize: '0.7rem', mb: 0.25 }}>
                    Après
                  </Typography>
                  <Typography component="pre" sx={{ color: '#B0B0B0', m: 0, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {JSON.stringify(log.new_values, null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    </Box>
  );
}

// -----------------------------------------------------------------------
// Main page
// -----------------------------------------------------------------------
export default function ActivityLog() {
  const [roleFilter, setRoleFilter] = useState(null);
  const [entityFilter, setEntityFilter] = useState(null);
  const [actionFilter, setActionFilter] = useState(null);
  const [activity, setActivity] = useState([]);

  const fetchData = async () => {
    try {
      const response = await Axios.get('/activity');
      setActivity(response.data.activity);
    } catch (err) {
      console.error('Failed to fetch activity log', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return activity
      .filter((log) => {
        if (roleFilter && log.user_role !== roleFilter) return false;
        if (entityFilter && log.entity_type !== entityFilter) return false;
        if (actionFilter && log.action !== actionFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // fixed: createdAt
  }, [activity, roleFilter, entityFilter, actionFilter]); // fixed: activity added as dependency

  const grouped = groupByDay(filtered);
  const dayKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const toggle = (current, setter, value) => setter(current === value ? null : value);

  return (
    <Box sx={{ bgcolor: '#141414', minHeight: '100%', p: { xs: 2, md: 4 } }}>
      <Typography sx={{ color: '#F5F5F5', fontSize: '1.4rem', fontWeight: 600, mb: 0.5 }}>
        Journal d'activité
      </Typography>
      <Typography sx={{ color: '#8A8A8A', fontSize: '0.85rem', mb: 3 }}>
        Historique des actions effectuées par les administrateurs et secrétaires
      </Typography>

      {/* Filters */}
      <Stack direction="row" spacing={3} sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          <Typography sx={{ color: '#6E6E6E', fontSize: '0.75rem', mr: 0.5 }}>Rôle</Typography>
          {['admin', 'secretary'].map((r) => (
            <Chip
              key={r}
              label={r === 'admin' ? 'Admin' : 'Secrétariat'}
              size="small"
              onClick={() => toggle(roleFilter, setRoleFilter, r)}
              sx={{
                fontSize: '0.72rem',
                bgcolor: roleFilter === r ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.05)',
                color: roleFilter === r ? '#D4AF37' : '#B0B0B0',
                border: roleFilter === r ? '1px solid #D4AF37' : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          <Typography sx={{ color: '#6E6E6E', fontSize: '0.75rem', mr: 0.5 }}>Type</Typography>
          {ENTITY_TYPES.map((t) => (
            <Chip
              key={t}
              label={ENTITY_LABELS[t]}
              size="small"
              onClick={() => toggle(entityFilter, setEntityFilter, t)}
              sx={{
                fontSize: '0.72rem',
                bgcolor: entityFilter === t ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.05)',
                color: entityFilter === t ? '#D4AF37' : '#B0B0B0',
                border: entityFilter === t ? '1px solid #D4AF37' : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          <Typography sx={{ color: '#6E6E6E', fontSize: '0.75rem', mr: 0.5 }}>Action</Typography>
          {Object.keys(ACTION_CONFIG).map((a) => (
            <Chip
              key={a}
              label={ACTION_CONFIG[a].label}
              size="small"
              onClick={() => toggle(actionFilter, setActionFilter, a)}
              sx={{
                fontSize: '0.72rem',
                bgcolor: actionFilter === a ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.05)',
                color: actionFilter === a ? '#D4AF37' : '#B0B0B0',
                border: actionFilter === a ? '1px solid #D4AF37' : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Timeline */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        {dayKeys.length === 0 && (
          <Typography sx={{ color: '#6E6E6E', fontSize: '0.85rem', textAlign: 'center', py: 4 }}>
            Aucune activité récente.
          </Typography>
        )}

        {dayKeys.map((key, idx) => (
          <Box key={key} sx={{ mb: idx < dayKeys.length - 1 ? 2 : 0 }}>
            <Typography
              sx={{
                color: '#D4AF37',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1.5,
              }}
            >
              {dayLabel(key)}
            </Typography>
            {grouped[key].map((log) => (
              <ActivityEntry key={log.id} log={log} />
            ))}
            {idx < dayKeys.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: 1, mb: 1 }} />
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}