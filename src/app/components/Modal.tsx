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
          bgcolor: '#fff',            
          color: '#fff',
          boxShadow: 24,
          borderRadius: 2,
          p: 6,
          width,
          maxWidth,
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <IconButton
          aria-label="Cerrar"
          onClick={() => router.back()}
          size="large"
          sx={{ position: 'absolute', top: 6, right: 6, color: '#242424' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* 👇 MUY IMPORTANTE */}
        {children}
      </Box>
    </MuiModal>
  );
}
