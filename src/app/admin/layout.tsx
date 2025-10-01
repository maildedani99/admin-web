"use client";

import * as React from "react";
import { Box, Toolbar, Container } from "@mui/material";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { adminMenu } from "@/config/menu";

export default function AdminLayout({ children, modals }: { children: React.ReactNode, modals:React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "grey.600" }}>
      {/* NAVBAR */}
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
        }}
      >
        <Toolbar /> {/* separador por AppBar fija */}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
          {modals}
        </Container>
      </Box>
    </Box>
  );
}
