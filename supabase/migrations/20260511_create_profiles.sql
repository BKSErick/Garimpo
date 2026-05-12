-- 1. Criar Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'STARTER', -- STARTER, MINERADOR, INDUSTRIAL, ADM
    role TEXT NOT NULL DEFAULT 'USER',    -- USER, ADMIN
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança (RLS)
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin (Service Role) tem acesso total (já garantido por padrão, mas bom reforçar)

-- 4. Função para Criar Perfil Automaticamente no Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, plan, role)
    VALUES (NEW.id, 'STARTER', 'USER');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para disparar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- NOTA: Se você já tem usuários e quer atualizar o seu para ADM:
-- UPDATE public.profiles SET plan = 'ADM', role = 'ADMIN' WHERE id = 'SEU_UUID_AQUI';
-- Ou apenas use o email admin@prospectos.com que o código já reconhece como fallback.
