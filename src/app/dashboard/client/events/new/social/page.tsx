import { PageHeader } from "@/components/dashboard/shell";
import { SocialEventForm } from "./social-form";

export const metadata = { title: "مناسبة اجتماعية جديدة" };

export default function NewSocialEventPage() {
  return (
    <div>
      <PageHeader
        title="أفراح ومناسبات اجتماعية"
        subtitle="عبّئ التفاصيل ليقوم محرك تحسين الميزانية بتوزيع ميزانيتك تلقائياً"
        backHref="/dashboard/client/events/new"
        backLabel="تغيير نوع المناسبة"
      />
      <SocialEventForm />
    </div>
  );
}
