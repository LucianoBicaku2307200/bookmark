CREATE TYPE activity_type AS ENUM ('number', 'checkbox');

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type activity_type NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- num_value is double precision, NOT numeric: PostgREST returns numeric as a
-- string, which fails every `typeof x === "number"` check downstream.
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  num_value double precision,
  bool_value boolean,
  created_at timestamptz DEFAULT now(),
  -- Parentheses are load-bearing: `IS` binds looser than `<>`, so the unparenthesized
  -- form parses as ((num_value IS NULL) <> bool_value) IS NULL and rejects every checkbox row.
  CONSTRAINT entry_value_matches_one_kind
    CHECK ((num_value IS NULL) <> (bool_value IS NULL))
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activities" ON activities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own entries" ON entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX activities_user_id_created_at_idx ON activities(user_id, created_at);
CREATE UNIQUE INDEX entries_unique_day ON entries(user_id, activity_id, date);
CREATE INDEX entries_by_date ON entries(user_id, date);
