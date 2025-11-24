// src/app/admin/@modals/courseInfo/[id]/page.tsx

import CourseInfo from "@/app/components/CourseInfo";


type CourseInfoPageProps = {
  params: {
    id: string; // viene del segmento [id] del router
  };
};

export default function CourseInfoModalPage({ params }: CourseInfoPageProps) {
  const idNum = Number(params.id);

  // Opcional: protección si no es número
  if (Number.isNaN(idNum)) {
    return <div>ID de curso inválido</div>;
  }

  return <CourseInfo id={idNum} />;
}
