import { noindexMetadata } from "@/src/lib/noindex-metadata";
import { BookingForm } from "./BookingForm";

export const metadata = noindexMetadata;

export default async function AgendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="bg-cream-50 min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <BookingForm slug={slug} />
      </div>
    </div>
  );
}
