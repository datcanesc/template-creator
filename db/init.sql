-- Templates Tablosu
CREATE TABLE IF NOT EXISTS templates (
    id serial PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- TemplateFields Tablosu
CREATE TABLE IF NOT EXISTS templatefields (
    id serial PRIMARY KEY,
    template_id integer REFERENCES templates(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, 
    is_required BOOLEAN DEFAULT false
);

-- TemplateRecords Tablosu
CREATE TABLE IF NOT EXISTS templaterecords (
    id serial PRIMARY KEY,
    template_id integer REFERENCES templates(id) ON DELETE CASCADE,
    record_data TEXT NOT NULL -- Key-value JSON formatında saklanacak
);