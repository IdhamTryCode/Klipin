-- Topup credits RPC — semantically separate from refund_credits.
-- Records the transaction as type='topup' (vs 'refund') so finance reports are accurate.
create or replace function public.topup_credits(
  p_user_id uuid,
  p_amount integer,
  p_reference_id text,
  p_description text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  update profiles
  set credits_balance = credits_balance + p_amount,
      updated_at = now()
  where id = p_user_id
  returning credits_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into credit_transactions (user_id, type, amount, balance_after, reference_id, description)
  values (p_user_id, 'topup', p_amount, v_new_balance, p_reference_id, p_description);

  return v_new_balance;
end;
$$;

grant execute on function public.topup_credits(uuid, integer, text, text) to service_role;
