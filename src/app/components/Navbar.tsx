"use client";

import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{ bgcolor: "grey.900", borderBottom: "1px solid", borderColor: "grey.800" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin
        </Typography>
        <div style={{ flex: 1 }} />
        {/* aquí podrás poner perfil / logout */}
      </Toolbar>
    </AppBar>
  );
}
