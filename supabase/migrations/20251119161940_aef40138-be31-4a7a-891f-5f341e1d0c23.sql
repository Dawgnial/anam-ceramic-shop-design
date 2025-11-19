-- Update the handle_new_user function to work with email format
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Extract phone from email (format: phone@anam.local)
  declare
    user_phone text;
  begin
    user_phone := split_part(new.email, '@', 1);
    
    -- Insert profile
    insert into public.profiles (id, phone)
    values (new.id, user_phone);
    
    -- Check if this is the admin phone number and assign admin role
    if user_phone = '09381895681' then
      insert into public.user_roles (user_id, role)
      values (new.id, 'admin');
    else
      -- Assign default user role
      insert into public.user_roles (user_id, role)
      values (new.id, 'user');
    end if;
    
    return new;
  end;
end;
$$;