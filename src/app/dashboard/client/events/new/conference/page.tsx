import { PageHeader } from "@/components/dashboard/shell";
import { ConferenceEventForm } from "./conference-form";

export const metadata = { title: "فعالية أو مؤتمر جديد" };

export default function NewConferenceEventPage() {
  return (
    <div>
      <PageHeader
        title="فعاليات ومؤتمرات"
        subtitle="نموذج مخصص للمؤتمرات والمعارض — يشمل الأجندة والجلسات والمتحدثين وأجنحة العرض"
        backHref="/dashboard/client/events/new"
        backLabel="تغيير نوع المناسبة"
      />
      <ConferenceEventForm />
    </div>
  );
}
