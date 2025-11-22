-- Fix storage upload policy for audio uploads
-- This allows uploads to the 'stories' bucket without authentication
-- The service role key should handle this, but this ensures it works

-- Drop existing restrictive policy
drop policy if exists "authenticated_upload_audio" on storage.objects;

-- Create more permissive upload policy
create policy "allow_upload_audio"
  on storage.objects for insert
  with check (bucket_id = 'stories');

-- Also ensure update/delete policies exist for service role operations
create policy if not exists "allow_update_audio"
  on storage.objects for update
  using (bucket_id = 'stories');

create policy if not exists "allow_delete_audio"
  on storage.objects for delete
  using (bucket_id = 'stories');
