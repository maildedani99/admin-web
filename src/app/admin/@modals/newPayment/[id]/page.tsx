// src/app/admin/@modals/newPayment/[id]/page.tsx

// Si tienes un componente real de formulario, impórtalo aquí
// import NewPaymentForm from "@/app/admin/components/NewPaymentForm";

export default function NewPaymentModalPage(props: any) {
  const idStr = props?.params?.id;
  const clientId = Number(idStr);

  if (!idStr || Number.isNaN(clientId)) {
    return <div>ID de cliente inválido</div>;
  }

  // Sustituye este JSX por tu formulario real
  // return <NewPaymentForm clientId={clientId} />;

  return (
    <div>
      <h1>Nuevo pago</h1>
      <p>Cliente ID: {clientId}</p>
    </div>
  );
}
