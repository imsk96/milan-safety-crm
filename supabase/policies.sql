-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can manage all users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Leads policies
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Staff can view assigned leads" ON leads FOR SELECT USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can update assigned leads" ON leads FOR UPDATE USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can insert leads" ON leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tasks policies
CREATE POLICY "Admin full access tasks" ON tasks FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Staff can view assigned tasks" ON tasks FOR SELECT USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can update assigned tasks" ON tasks FOR UPDATE USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can insert tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Dispatch policies
CREATE POLICY "Admin full access dispatch" ON dispatch FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Staff can view assigned dispatch" ON dispatch FOR SELECT USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can update assigned dispatch" ON dispatch FOR UPDATE USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can insert dispatch" ON dispatch FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Visits policies
CREATE POLICY "Admin full access visits" ON visits FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Staff can view assigned visits" ON visits FOR SELECT USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can update assigned visits" ON visits FOR UPDATE USING (assigned_to = (SELECT tag_name FROM users WHERE id = auth.uid()));
CREATE POLICY "Staff can insert visits" ON visits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Settings policies
CREATE POLICY "Anyone can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON settings FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));