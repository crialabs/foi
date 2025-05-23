export const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz submissions table
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  age TEXT,
  supplements TEXT,
  prize TEXT,
  status TEXT DEFAULT 'new',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prize configurations table
CREATE TABLE IF NOT EXISTS prize_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  probability INTEGER NOT NULL,
  active BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submissionId INTEGER,
  message TEXT NOT NULL,
  direction TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submissionId) REFERENCES quiz_submissions(id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  primaryColor TEXT DEFAULT '#6d28d9',
  secondaryColor TEXT DEFAULT '#a855f7',
  accentColor TEXT DEFAULT '#f3c677',
  fontFamily TEXT DEFAULT 'Geist',
  logoUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form steps table
CREATE TABLE IF NOT EXISTS form_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  orderIndex INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE
);

-- Form fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stepId INTEGER NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN DEFAULT 0,
  options TEXT,
  orderIndex INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stepId) REFERENCES form_steps(id) ON DELETE CASCADE
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formId INTEGER NOT NULL,
  data TEXT NOT NULL,
  prize TEXT,
  status TEXT DEFAULT 'new',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE
);

-- Form visits table
CREATE TABLE IF NOT EXISTS form_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formId INTEGER NOT NULL,
  visitedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE
);
`
