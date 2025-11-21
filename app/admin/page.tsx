import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';
import AdminTable from '@/components/AdminTable';
import PhoneAudioConfig from '@/components/PhoneAudioConfig';
import { TaskProgressList } from '@/components/TaskProgressBar';
import AdminLogin from './AdminLogin';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { password?: string };
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const isAuthenticated = sessionCookie?.value === process.env.ADMIN_PASSWORD;

  // Check password from query params
  if (searchParams.password === process.env.ADMIN_PASSWORD) {
    // Set cookie and redirect to clean URL
    const response = redirect('/admin');
    // Note: In real Next.js, we'd use middleware or API route to set cookie
  }

  if (!isAuthenticated && searchParams.password !== process.env.ADMIN_PASSWORD) {
    return <AdminLogin />;
  }

  // Fetch all stories
  const supabase = getServiceSupabase();
  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-cardboard flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading stories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cardboard p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-soot mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg font-sans text-soot/60">
            Manage stories, consent, and archive content
          </p>
        </div>

        {/* Phone Audio Configuration Section */}
        <div className="mb-12">
          <PhoneAudioConfig />
        </div>

        {/* Stories Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-soot mb-4">
            Stories Management
          </h2>
        </div>
        <AdminTable initialStories={stories || []} />
      </div>
      
      {/* Progress indicators for active tasks - fixed position bottom right */}
      <TaskProgressList />
    </div>
  );
}
