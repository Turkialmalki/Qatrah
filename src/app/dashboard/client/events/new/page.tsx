import { PageHeader } from "@/components/dashboard/shell";
import { NewEventForm } from "./new-event-form";

export default function NewEventPage() {
  return (
    <div>
      <PageHeader title="مناسبة جديدة" subtitle="عبّئ التفاصيل ليقوم محرك تحسين الميزانية بتوزيع ميزانيتك تلقائياً" />
      <NewEventForm />
    </div>
  );
}
