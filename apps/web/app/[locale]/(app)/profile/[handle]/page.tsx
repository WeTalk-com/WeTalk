export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  // TODO(api): fetch user by handle and render their profile
  const { handle } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-brown-sec">Profil de @{handle} — bientôt disponible</p>
    </main>
  );
}
