import { notFound } from "next/navigation";
import CourseInfo from "@/app/components/CourseInfo";
import Modal from "@/app/components/Modal";


type CourseInfoPageProps = {
  params: {
    id: string;
  };
};

export default function CourseInfoModalPage({ params }: CourseInfoPageProps) {
  const { id } = params;
  


  return (
    <Modal>
      <CourseInfo id={params.id} />
    </Modal>
  );
}
