'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Modal as MuiModal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  children: React.ReactNode;
  width?: number | string;
  maxWidth?: number | string;
};

export default function Modal({ children, width = 'min(900px, 92vw)', maxWidth = '90vw' }: Props) {
  const router = useRouter();

  return (
    <MuiModal
      open
      onClose={() => router.back()}
      slotProps={{ backdrop: { timeout: 150 } }}
      keepMounted
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#111',            // panel oscuro para tu tema
          color: '#fff',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          width,
          maxWidth,
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <IconButton
          aria-label="Cerrar"
          onClick={() => router.back()}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, color: '#bbb' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* 👇 MUY IMPORTANTE */}
        {children}
      </Box>
    </MuiModal>
  );
}
