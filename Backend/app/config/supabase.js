const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://gysyeqyjsoyvngxupzsb.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;