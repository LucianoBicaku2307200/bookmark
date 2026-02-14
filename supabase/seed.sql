-- ============================================
-- SEED DATA FOR TESTING
-- ============================================
-- This script populates the database with mock data from the original project
-- 
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users
-- You can get this by signing up a test user and running:
-- SELECT id FROM auth.users WHERE email = 'your-test-email@example.com';

-- Set the user ID variable (REPLACE THIS WITH YOUR ACTUAL USER ID)
-- Example: \set user_id '12345678-1234-1234-1234-123456789abc'

-- ============================================
-- COLLECTIONS
-- ============================================
INSERT INTO collections (user_id, name, icon, color) VALUES
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Design Resources', 'palette', 'violet'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Development', 'code', 'blue'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Tools', 'wrench', 'amber'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Reading List', 'book-open', 'emerald'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Inspiration', 'sparkles', 'pink');

-- ============================================
-- TAGS
-- ============================================
INSERT INTO tags (user_id, name, color) VALUES
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'React', 'bg-blue-500/10 text-blue-500'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'TypeScript', 'bg-blue-600/10 text-blue-600'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'UI/UX', 'bg-violet-500/10 text-violet-500'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Next.js', 'bg-foreground/10 text-foreground'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Tailwind', 'bg-cyan-500/10 text-cyan-500'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Tutorial', 'bg-emerald-500/10 text-emerald-500'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Documentation', 'bg-amber-500/10 text-amber-500'),
  ('f9ac9b99-3464-4eb0-bd71-bdaf6f12a10e', 'Free', 'bg-green-500/10 text-green-500');

-- Get the collection IDs we just created
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_ID_HERE';
  design_collection_id UUID;
  dev_collection_id UUID;
  tools_collection_id UUID;
  reading_collection_id UUID;
  inspiration_collection_id UUID;
  
  react_tag_id UUID;
  typescript_tag_id UUID;
  uiux_tag_id UUID;
  nextjs_tag_id UUID;
  tailwind_tag_id UUID;
  tutorial_tag_id UUID;
  docs_tag_id UUID;
  free_tag_id UUID;
BEGIN
  -- Get collection IDs
  SELECT id INTO design_collection_id FROM collections WHERE user_id = user_uuid AND name = 'Design Resources';
  SELECT id INTO dev_collection_id FROM collections WHERE user_id = user_uuid AND name = 'Development';
  SELECT id INTO tools_collection_id FROM collections WHERE user_id = user_uuid AND name = 'Tools';
  SELECT id INTO reading_collection_id FROM collections WHERE user_id = user_uuid AND name = 'Reading List';
  SELECT id INTO inspiration_collection_id FROM collections WHERE user_id = user_uuid AND name = 'Inspiration';
  
  -- Get tag IDs
  SELECT id INTO react_tag_id FROM tags WHERE user_id = user_uuid AND name = 'React';
  SELECT id INTO typescript_tag_id FROM tags WHERE user_id = user_uuid AND name = 'TypeScript';
  SELECT id INTO uiux_tag_id FROM tags WHERE user_id = user_uuid AND name = 'UI/UX';
  SELECT id INTO nextjs_tag_id FROM tags WHERE user_id = user_uuid AND name = 'Next.js';
  SELECT id INTO tailwind_tag_id FROM tags WHERE user_id = user_uuid AND name = 'Tailwind';
  SELECT id INTO tutorial_tag_id FROM tags WHERE user_id = user_uuid AND name = 'Tutorial';
  SELECT id INTO docs_tag_id FROM tags WHERE user_id = user_uuid AND name = 'Documentation';
  SELECT id INTO free_tag_id FROM tags WHERE user_id = user_uuid AND name = 'Free';

  -- ============================================
  -- BOOKMARKS
  -- ============================================
  INSERT INTO bookmarks (user_id, collection_id, title, url, description, favicon, is_favorite, has_dark_icon, created_at) VALUES
    (user_uuid, dev_collection_id, 'Shadcn UI', 'https://ui.shadcn.com', 'Beautifully designed components built with Radix UI and Tailwind CSS.', 'https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64', true, true, '2024-01-15'),
    (user_uuid, dev_collection_id, 'Vercel', 'https://vercel.com', 'Develop. Preview. Ship. The best frontend developer experience.', 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64', true, true, '2024-01-14'),
    (user_uuid, dev_collection_id, 'Tailwind CSS', 'https://tailwindcss.com', 'A utility-first CSS framework for rapid UI development.', 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64', false, false, '2024-01-13'),
    (user_uuid, design_collection_id, 'Figma', 'https://figma.com', 'The collaborative interface design tool.', 'https://www.google.com/s2/favicons?domain=figma.com&sz=64', true, false, '2024-01-12'),
    (user_uuid, inspiration_collection_id, 'Dribbble', 'https://dribbble.com', 'Discover the world''s top designers & creatives.', 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=64', false, false, '2024-01-11'),
    (user_uuid, dev_collection_id, 'React Documentation', 'https://react.dev', 'The library for web and native user interfaces.', 'https://www.google.com/s2/favicons?domain=react.dev&sz=64', true, false, '2024-01-10'),
    (user_uuid, dev_collection_id, 'TypeScript Handbook', 'https://typescriptlang.org', 'TypeScript is JavaScript with syntax for types.', 'https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=64', false, false, '2024-01-09'),
    (user_uuid, dev_collection_id, 'Next.js Documentation', 'https://nextjs.org', 'The React Framework for the Web.', 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=64', true, true, '2024-01-08'),
    (user_uuid, tools_collection_id, 'Lucide Icons', 'https://lucide.dev', 'Beautiful & consistent icon toolkit made by the community.', 'https://www.google.com/s2/favicons?domain=lucide.dev&sz=64', false, false, '2024-01-07'),
    (user_uuid, dev_collection_id, 'Radix UI', 'https://radix-ui.com', 'Unstyled, accessible components for building design systems.', 'https://www.google.com/s2/favicons?domain=radix-ui.com&sz=64', false, true, '2024-01-06'),
    (user_uuid, tools_collection_id, 'Linear', 'https://linear.app', 'The issue tracking tool you''ll enjoy using.', 'https://www.google.com/s2/favicons?domain=linear.app&sz=64', true, false, '2024-01-05'),
    (user_uuid, tools_collection_id, 'Notion', 'https://notion.so', 'The all-in-one workspace for your notes, tasks, wikis, and databases.', 'https://www.google.com/s2/favicons?domain=notion.so&sz=64', false, true, '2024-01-04'),
    (user_uuid, inspiration_collection_id, 'Awwwards', 'https://awwwards.com', 'The awards of design, creativity and innovation on the internet.', 'https://www.google.com/s2/favicons?domain=awwwards.com&sz=64', false, false, '2024-01-03'),
    (user_uuid, reading_collection_id, 'Frontend Masters', 'https://frontendmasters.com', 'Advance your skills with in-depth, modern front-end courses.', 'https://www.google.com/s2/favicons?domain=frontendmasters.com&sz=64', false, false, '2024-01-02'),
    (user_uuid, reading_collection_id, 'CSS Tricks', 'https://css-tricks.com', 'Daily articles about CSS, HTML, JavaScript, and all things web design.', 'https://www.google.com/s2/favicons?domain=css-tricks.com&sz=64', false, false, '2024-01-01'),
    (user_uuid, design_collection_id, 'Framer', 'https://framer.com', 'Ship sites with unmatched speed and style.', 'https://www.google.com/s2/favicons?domain=framer.com&sz=64', true, true, '2023-12-31');

  -- ============================================
  -- BOOKMARK_TAGS
  -- ============================================
  -- Get bookmark IDs and assign tags
  INSERT INTO bookmark_tags (bookmark_id, tag_id)
  SELECT b.id, react_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Shadcn UI'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Shadcn UI'
  UNION ALL
  SELECT b.id, tailwind_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Shadcn UI'
  UNION ALL
  SELECT b.id, nextjs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Vercel'
  UNION ALL
  SELECT b.id, tailwind_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Tailwind CSS'
  UNION ALL
  SELECT b.id, docs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Tailwind CSS'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Figma'
  UNION ALL
  SELECT b.id, free_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Figma'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Dribbble'
  UNION ALL
  SELECT b.id, react_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'React Documentation'
  UNION ALL
  SELECT b.id, docs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'React Documentation'
  UNION ALL
  SELECT b.id, tutorial_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'React Documentation'
  UNION ALL
  SELECT b.id, typescript_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'TypeScript Handbook'
  UNION ALL
  SELECT b.id, docs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'TypeScript Handbook'
  UNION ALL
  SELECT b.id, nextjs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Next.js Documentation'
  UNION ALL
  SELECT b.id, react_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Next.js Documentation'
  UNION ALL
  SELECT b.id, docs_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Next.js Documentation'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Lucide Icons'
  UNION ALL
  SELECT b.id, free_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Lucide Icons'
  UNION ALL
  SELECT b.id, react_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Radix UI'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Radix UI'
  UNION ALL
  SELECT b.id, free_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Notion'
  UNION ALL
  SELECT b.id, tutorial_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Frontend Masters'
  UNION ALL
  SELECT b.id, react_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Frontend Masters'
  UNION ALL
  SELECT b.id, typescript_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Frontend Masters'
  UNION ALL
  SELECT b.id, tutorial_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'CSS Tricks'
  UNION ALL
  SELECT b.id, tailwind_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'CSS Tricks'
  UNION ALL
  SELECT b.id, uiux_tag_id FROM bookmarks b WHERE b.user_id = user_uuid AND b.title = 'Framer';
  
END $$;
