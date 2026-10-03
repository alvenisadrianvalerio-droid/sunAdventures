-- Ejecutar en Supabase SQL Editor después de crear las preferencias y desplegar
-- la función finance-reminders.
--
-- Antes, guardar en Vault:
--   sunadventures_project_url: URL pública del proyecto Supabase
--   sunadventures_finance_reminders_cron_secret: el mismo valor aleatorio
--   configurado como FINANCE_REMINDER_CRON_SECRET en Edge Function secrets.
-- No pegar ni versionar el secreto en este archivo.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'sunadventures-finance-reminders';

select cron.schedule(
  'sunadventures-finance-reminders',
  '* * * * *',
  $job$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'sunadventures_project_url'
      ) || '/functions/v1/finance-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'sunadventures_finance_reminders_cron_secret'
        )
      ),
      body := '{}'::jsonb
    );
  $job$
);
