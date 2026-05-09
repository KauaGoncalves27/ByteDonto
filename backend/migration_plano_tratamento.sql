CREATE TABLE IF NOT EXISTS planos_tratamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    dentista_id UUID REFERENCES usuarios(id),
    titulo TEXT NOT NULL DEFAULT 'Plano de Tratamento',
    status TEXT CHECK (status IN ('Orcamento', 'Aprovado', 'Em Andamento', 'Concluido', 'Cancelado')) DEFAULT 'Orcamento',
    valor_total DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plano_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plano_id UUID REFERENCES planos_tratamento(id) ON DELETE CASCADE,
    procedimento TEXT NOT NULL,
    dente TEXT,
    quantidade INTEGER DEFAULT 1,
    valor_unitario DECIMAL(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('Pendente', 'Concluido', 'Cancelado')) DEFAULT 'Pendente',
    ordem INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS paciente_imagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    nome TEXT,
    url TEXT,
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
