/** Page statique simple (À propos, Aide, Conditions, Confidentialité). */
export function StaticPage({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      <div className="px-5 pt-6">
        <h1 className="font-display text-3xl font-bold text-brown">{title}</h1>
      </div>
      <div className="px-5 pb-24 pt-5 lg:pb-10">
        <p className="max-w-prose whitespace-pre-line leading-relaxed text-brown-sec">
          {body}
        </p>
      </div>
    </main>
  );
}
