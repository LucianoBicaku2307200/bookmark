CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE note_tags (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (note_id, tag_id)
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own note_tags" ON note_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM notes WHERE notes.id = note_id AND notes.user_id = auth.uid())
  );

CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX note_tags_note_id_idx ON note_tags(note_id);
CREATE INDEX note_tags_tag_id_idx ON note_tags(tag_id);
