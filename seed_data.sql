-- Dodavanje osnovnih mirisa za svijeće ako ne postoje
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Lavanda') THEN
    INSERT INTO scents (name, description, active) VALUES ('Lavanda', 'Umirujući miris lavande za opuštanje', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Vanilija') THEN
    INSERT INTO scents (name, description, active) VALUES ('Vanilija', 'Slatki miris vanilije za ugodnu atmosferu', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Cimet') THEN
    INSERT INTO scents (name, description, active) VALUES ('Cimet', 'Topli miris cimeta za zimske večeri', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Jasmin') THEN
    INSERT INTO scents (name, description, active) VALUES ('Jasmin', 'Cvjetni miris jasmina za romantičnu atmosferu', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Sandalovina') THEN
    INSERT INTO scents (name, description, active) VALUES ('Sandalovina', 'Egzotični miris sandalovine za meditaciju', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Citrus') THEN
    INSERT INTO scents (name, description, active) VALUES ('Citrus', 'Osvježavajući miris citrusa za energiju', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Jabuka i cimet') THEN
    INSERT INTO scents (name, description, active) VALUES ('Jabuka i cimet', 'Ugodna kombinacija mirisa jabuke i cimeta', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Ruža') THEN
    INSERT INTO scents (name, description, active) VALUES ('Ruža', 'Elegantni miris ruže za posebne prilike', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Bor') THEN
    INSERT INTO scents (name, description, active) VALUES ('Bor', 'Svježi miris bora za blagdane', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Eukaliptus') THEN
    INSERT INTO scents (name, description, active) VALUES ('Eukaliptus', 'Proćišćavajući miris eukaliptusa', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Mint') THEN
    INSERT INTO scents (name, description, active) VALUES ('Mint', 'Svježi miris mente za fokus i koncentraciju', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM scents WHERE name = 'Kokonut') THEN
    INSERT INTO scents (name, description, active) VALUES ('Kokonut', 'Tropski miris kokosa za ljetnu atmosferu', true);
  END IF;
END $$;

-- Dodavanje osnovnih boja za svijeće
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Bijela') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Bijela', '#FFFFFF', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Bež') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Bež', '#F5F5DC', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Zlatna') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Zlatna', '#FFD700', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Srebrna') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Srebrna', '#C0C0C0', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Crvena') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Crvena', '#FF0000', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Zelena') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Zelena', '#008000', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Plava') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Plava', '#0000FF', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Žuta') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Žuta', '#FFFF00', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Ljubičasta') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Ljubičasta', '#800080', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Ružičasta') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Ružičasta', '#FFC0CB', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Crna') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Crna', '#000000', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Narančasta') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Narančasta', '#FFA500', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Smeđa') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Smeđa', '#A52A2A', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM colors WHERE name = 'Tirkizna') THEN
    INSERT INTO colors (name, hex_value, active) VALUES ('Tirkizna', '#40E0D0', true);
  END IF;
END $$;