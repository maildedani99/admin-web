// src/app/admin/@modals/courseInfo/[id]/page.tsx

import Modal from "@/app/components/Modal";
import CourseInfo from "@/app/components/CourseInfo";

export default function CourseInfoModalPage(props: any) {
  const idStr = props?.params?.id;
  const idNum = Number(idStr);

  if (!idStr || Number.isNaN(idNum)) {
    return (
      <Modal>
        <div>ID de curso inválido</div>
      </Modal>
    );
  }

  return (
    <Modal>
      <CourseInfo id={idNum} />
    </Modal>
  );
}
