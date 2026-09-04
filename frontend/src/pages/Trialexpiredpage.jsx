import React, { useState } from "react";
import { Box, Paper, Typography, Button, Stack, Snackbar, Alert } from "@mui/material";
import LockClockIcon from "@mui/icons-material/LockClock";
import PhoneIcon from "@mui/icons-material/Phone";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const GOLD = "#D4AF37";

// ASSUMPTION: replace with the real contact number. Kept as a single
// constant so it's easy to update in one place (or wire up to an env var /
// config file later if it might change).
const PHONE_NUMBER = "21242663";

export default function TrialExpiredPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PHONE_NUMBER);
      setCopied(true);
    } catch (err) {
      // Clipboard API can fail in some Electron contexts without permissions —
      // the number is still visible on screen for the user to note down.
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          backgroundColor: "#1e1e1e",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(212,175,55,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <LockClockIcon sx={{ fontSize: 36, color: GOLD }} />
        </Box>

        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}>
          Période d'essai terminée
        </Typography>

        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 4, lineHeight: 1.6 }}>
          Votre essai gratuit de Galaxy Gym est arrivé à son terme. Pour continuer à
          utiliser l'application, veuillez nous contacter au numéro ci-dessous.
        </Typography>

        <Box
          sx={{
            backgroundColor: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 2,
            py: 2.5,
            px: 2,
            mb: 3,
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", mb: 0.5 }}>
            Contactez-nous
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: GOLD, fontWeight: 700, letterSpacing: 0.5 }}
          >
            {PHONE_NUMBER}
          </Typography>
        </Box>

        
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopied(false)} severity="success" variant="filled">
          Numéro copié dans le presse-papiers.
        </Alert>
      </Snackbar>
    </Box>
  );
}