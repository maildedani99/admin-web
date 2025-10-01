import ClientView from "@/app/components/ClientView";
import Modal from "@/app/components/Modal";

// src/routes/users.[id].tsx
export default function UserPage({ params }: { params: { id: string } }) {
  return(
    <Modal>
       <ClientView id="6" />
       </Modal>
  );
}
