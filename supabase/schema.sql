-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  tag_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  gst_no TEXT,
  address TEXT,
  product_required TEXT,
  quantity INTEGER,
  next_action TEXT,
  follow_up_date DATE,
  assigned_to TEXT REFERENCES users(tag_name) ON DELETE SET NULL,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Working', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task TEXT NOT NULL,
  location TEXT,
  assigned_to TEXT REFERENCES users(tag_name) ON DELETE SET NULL,
  remarks TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Working', 'Done', 'Book Again')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch
CREATE TABLE dispatch (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT,
  items TEXT,
  assigned_to TEXT REFERENCES users(tag_name) ON DELETE SET NULL,
  party_name TEXT,
  contact_details TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT,
  samples TEXT,
  assigned_to TEXT REFERENCES users(tag_name) ON DELETE SET NULL,
  party_name TEXT,
  contact_details TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (background image)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  background_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE leads, tasks, dispatch, visits, notifications;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dispatch_updated_at BEFORE UPDATE ON dispatch FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();