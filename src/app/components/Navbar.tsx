"use client";

import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="inherit" // usamos el color que definimos en sx
      sx={{
        bgcolor: "grey.900",        // barra oscura
        color: "grey.100",          // texto claro en toda la barra
        borderBottom: "1px solid",
        borderColor: "grey.800",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Título */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "inherit", textTransform: "none" }}
        >
          Rebirth Dashboard
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Menú de usuario (obtiene el usuario real si hay token) */}
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
