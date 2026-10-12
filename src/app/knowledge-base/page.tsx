import { createClient } from "@/lib/db/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default async function KnowledgeBasePage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Navbar />
      <section className="navy-gradient py-16 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-gold-400" />
        <h1 className="text-3xl font-extrabold text-white">قاعدة المعرفة</h1>
        <p className="mt-2 text-cream/70">كل ما تحتاج معرفته عن التسعير العادل، الجودة، والتخطيط لمناسبتك</p>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-2">
          {(articles ?? []).map((a) => (
            <Card key={a.id}>
              <CardBody>
                <Badge tone="gold" className="mb-2">{a.category}</Badge>
                <h3 className="font-bold text-navy-950">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-900/70">{a.content}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
