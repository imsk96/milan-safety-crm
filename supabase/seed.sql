-- Create admin user (run after creating auth user manually)
-- Replace with actual auth user ID after creation
INSERT INTO users (id, name, login_id, role, tag_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin User', 'admin', 'admin', '@admin');

-- Insert sample data
INSERT INTO leads (company_name, contact_name, phone, product_required, assigned_to, status)
VALUES 
  ('ABC Corp', 'John Doe', '9876543210', 'Safety Helmets', '@admin', 'New'),
  ('XYZ Industries', 'Jane Smith', '8765432109', 'Safety Shoes', '@admin', 'Working');

INSERT INTO tasks (task, assigned_to, status, due_date)
VALUES 
  ('Follow up with ABC Corp', '@admin', 'Pending', CURRENT_DATE + INTERVAL '2 days'),
  ('Prepare quotation for XYZ', '@admin', 'Working', CURRENT_DATE + INTERVAL '1 day');