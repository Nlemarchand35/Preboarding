-- Index pour accélérer la requête cron (très fréquente)
create index if not exists idx_hires_pending_start
  on hires(start_date, status)
  where status = 'pending';

-- Index pour la déduplication des rappels
create index if not exists idx_reminder_logs_hire_type
  on reminder_logs(hire_id, reminder_type);
