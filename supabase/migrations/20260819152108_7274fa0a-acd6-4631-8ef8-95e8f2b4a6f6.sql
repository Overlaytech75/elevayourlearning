REVOKE ALL ON FUNCTION public.handle_new_user_extras() FROM public;
REVOKE ALL ON FUNCTION public.handle_new_user_extras() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user_extras() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_extras() FROM service_role;