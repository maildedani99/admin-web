"use client";

import * as React from "react";
import { Box, Toolbar, Container, Paper } from "@mui/material";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { adminMenu } from "@/config/menu";

export default function AdminLayout({
  children,
  modals,
}: {
  children: React.ReactNode;
  modals: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        bgcolor: "grey.100", // 👈 fondo claro global
      }}
    >
      {/* NAVBAR fija */}
      <Navbar />

      {/* SIDEBAR fijo */}
      <Sidebar menu={adminMenu} permanent />

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // evita overflow por flexbox
          overflow: "auto", // scroll solo en el contenido
        }}
      >
        {/* separador por AppBar fija */}
        <Toolbar />

        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Superficie clara para el contenido */}
        
            {children}

          {/* Portales / modales paralelos */}
          {modals}
        </Container>
      </Box>
    </Box>
  );
}
