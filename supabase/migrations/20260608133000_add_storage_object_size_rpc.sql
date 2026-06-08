create or replace function public.get_storage_bucket_object_sizes(p_bucket_id text)
returns table(name text, size_bytes bigint)
language sql
security definer
set search_path = public
as $$
  with object_sizes as (
    select
      objects.name,
      coalesce(
        objects.metadata->>'size',
        objects.metadata->>'file_size',
        objects.metadata->>'fileSize',
        objects.metadata->>'contentLength',
        objects.metadata->>'content_length',
        objects.metadata->>'Content-Length'
      ) as raw_size
    from storage.objects
    where objects.bucket_id = p_bucket_id
  )
  select
    object_sizes.name,
    case
      when object_sizes.raw_size ~ '^[0-9]+(\.[0-9]+)?$'
        then floor(object_sizes.raw_size::numeric)::bigint
      else 0
    end as size_bytes
  from object_sizes;
$$;

revoke all on function public.get_storage_bucket_object_sizes(text) from public;
grant execute on function public.get_storage_bucket_object_sizes(text) to service_role;
