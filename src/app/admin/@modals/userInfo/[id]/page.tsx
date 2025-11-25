import ClientView from "@/app/components/ClientView";
import Modal from "@/app/components/Modal";

// 👇 SIN tipos en la firma, solo props: any
export default function UserInfo(props: any) {
  const id = props?.params?.id;

  return (
    <Modal>
      <ClientView id={id} />
    </Modal>
  );
}
