import { notFound } from "next/navigation";
import CourseInfo from "@/app/components/CourseInfo";
import Modal from "@/app/components/Modal";



export default function CourseInfoPage({
  params,
}: {
  params: { id: string };
}) {
  


  return (
    <Modal>
      <CourseInfo id={params.id} />
    </Modal>
  );
}
