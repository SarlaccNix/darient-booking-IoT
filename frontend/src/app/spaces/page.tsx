import { SpaceList } from '@/components/SpaceList';

export const metadata = { title: 'Spaces — Workspace Booking' };

export default function SpacesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse available spaces and book your next session.
        </p>
      </div>
      <SpaceList />
    </main>
  );
}
