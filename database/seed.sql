-- Scripts SQL para inserção de dados iniciais
-- Dados de exemplo para o MVP do ServPlat

-- Inserir categorias de serviços
INSERT OR IGNORE INTO service_categories (name, description) VALUES
('Limpeza', 'Serviços de limpeza residencial e comercial'),
('Reparos', 'Reparos e manutenção em geral'),
('Instalação', 'Instalação de equipamentos e sistemas'),
('Consultoria', 'Serviços de consultoria técnica'),
('Outros', 'Outros tipos de serviços');

-- Inserir usuário de exemplo (prestador)
INSERT OR IGNORE INTO users (name, email, password, phone, city, user_type) VALUES
('João Silva', 'joao@email.com', '$2b$10$example_hash', '(11) 99999-9999', 'São Paulo', 'prestador');

-- Inserir usuário de exemplo (cliente)
INSERT OR IGNORE INTO users (name, email, password, phone, city, user_type) VALUES
('Maria Santos', 'maria@email.com', '$2b$10$example_hash', '(11) 88888-8888', 'São Paulo', 'cliente');

-- Inserir serviços de exemplo
INSERT OR IGNORE INTO services (provider_id, category_id, title, description, price, price_type, city, rating, rating_count) VALUES
(1, 3, 'Instalação de Ar Condicionado', 'Instalação profissional de ar condicionado com garantia', 500.00, 'fixo', 'São Paulo', 4.8, 15),
(1, 2, 'Reparo de Eletrodomésticos', 'Reparo de geladeiras, máquinas de lavar e outros eletrodomésticos', 150.00, 'por_hora', 'São Paulo', 4.5, 8),
(1, 1, 'Limpeza Residencial', 'Limpeza completa de residências', 80.00, 'por_hora', 'São Paulo', 4.9, 25);

-- Inserir horários disponíveis para os serviços
INSERT OR IGNORE INTO available_schedules (service_id, day_of_week, start_time, end_time) VALUES
-- Horários para Instalação de Ar Condicionado (service_id = 1)
(1, 1, '08:00', '18:00'), -- Segunda-feira
(1, 2, '08:00', '18:00'), -- Terça-feira
(1, 3, '08:00', '18:00'), -- Quarta-feira
(1, 4, '08:00', '18:00'), -- Quinta-feira
(1, 5, '08:00', '18:00'), -- Sexta-feira
(1, 6, '08:00', '14:00'), -- Sábado

-- Horários para Reparo de Eletrodomésticos (service_id = 2)
(2, 1, '09:00', '17:00'), -- Segunda-feira
(2, 2, '09:00', '17:00'), -- Terça-feira
(2, 3, '09:00', '17:00'), -- Quarta-feira
(2, 4, '09:00', '17:00'), -- Quinta-feira
(2, 5, '09:00', '17:00'), -- Sexta-feira

-- Horários para Limpeza Residencial (service_id = 3)
(3, 1, '07:00', '19:00'), -- Segunda-feira
(3, 2, '07:00', '19:00'), -- Terça-feira
(3, 3, '07:00', '19:00'), -- Quarta-feira
(3, 4, '07:00', '19:00'), -- Quinta-feira
(3, 5, '07:00', '19:00'), -- Sexta-feira
(3, 6, '07:00', '15:00'), -- Sábado
(3, 0, '08:00', '12:00'); -- Domingo
