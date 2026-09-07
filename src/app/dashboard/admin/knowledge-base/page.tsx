import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { createKbArticleAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { KbDeleteButton } from "./kb-delete-button";

export default async function AdminKnowledgeBasePage() {
  const supabase = await createClient();
  const { data: articles } = await supabase.from("knowledge_base").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="قاعدة المعرفة" subtitle="أدر مقالات ودلائل قاعدة المعرفة الظاهرة للعملاء ومقدمي الخدمة" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {(articles ?? []).map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-gold-600">{a.category}</div>
                  <div className="font-bold text-navy-950">{a.title}</div>
                  <p className="mt-1 text-sm text-navy-900/60">{a.content}</p>
                </div>
                <KbDeleteButton id={a.id} />
              </CardBody>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardBody>
            <h3 className="mb-3 font-bold text-navy-950">مقالة جديدة</h3>
            <form action={createKbArticleAction} className="space-y-3">
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Input id="category" name="category" placeholder="مثال: التسعير" required />
              </div>
              <div>
                <Label htmlFor="title">العنوان</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="content">المحتوى</Label>
                <Textarea id="content" name="content" required />
              </div>
              <div>
                <Label htmlFor="tags">الوسوم (افصل بفاصلة)</Label>
                <Input id="tags" name="tags" />
              </div>
              <Button type="submit" className="w-full">نشر المقالة</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
