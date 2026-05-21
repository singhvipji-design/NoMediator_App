-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  price NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  bhk TEXT NOT NULL,
  sqft INTEGER NOT NULL,
  beds INTEGER NOT NULL DEFAULT 1,
  baths INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL,
  furnished TEXT NOT NULL DEFAULT 'Unfurnished',
  parking BOOLEAN DEFAULT FALSE,
  pet_friendly BOOLEAN DEFAULT FALSE,
  gym BOOLEAN DEFAULT FALSE,
  lift BOOLEAN DEFAULT FALSE,
  security BOOLEAN DEFAULT FALSE,
  color_start TEXT NOT NULL DEFAULT '#E8121A',
  color_end TEXT NOT NULL DEFAULT '#FF6F00',
  tag TEXT NOT NULL DEFAULT 'Zero Brokerage',
  available TEXT NOT NULL DEFAULT 'Immediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Favorites Table (User saves a property)
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Create Visits Table (User schedules a visit)
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Inquiries Table (User clicks Contact Owner)
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_id)
);
