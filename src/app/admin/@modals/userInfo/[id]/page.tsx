import ClientView from "@/app/components/ClientView";
import Modal from "@/app/components/Modal";


export default function UserInfo ({
  params,
}: {
  params: { id: string };
}) {


    return ( 
         <Modal>
               <ClientView id={params.id} />
               </Modal>
    )
}