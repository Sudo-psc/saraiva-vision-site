-- Migration: Instagram Cache Table
-- Tabela para cache de posts do Instagram com dados reais

-- Criar tabela para cache do Instagram
CREATE TABLE IF NOT EXISTS instagram_cache (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    posts JSONB NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'fallback',
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_instagram_cache_username ON instagram_cache(username);
CREATE INDEX IF NOT EXISTS idx_instagram_cache_expires_at ON instagram_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_instagram_cache_source ON instagram_cache(source);

-- Comentários para documentação
COMMENT ON TABLE instagram_cache IS 'Cache de posts do Instagram para @saraiva_vision';
COMMENT ON COLUMN instagram_cache.id IS 'Identificador único (ex: saraiva_vision_cache)';
COMMENT ON COLUMN instagram_cache.username IS 'Username do Instagram (@saraiva_vision)';
COMMENT ON COLUMN instagram_cache.posts IS 'Array JSON com posts do Instagram';
COMMENT ON COLUMN instagram_cache.source IS 'Fonte dos dados (instagram_api, rss_feed, fallback)';
COMMENT ON COLUMN instagram_cache.fetched_at IS 'Timestamp de quando foi buscado';
COMMENT ON COLUMN instagram_cache.expires_at IS 'Timestamp de expiração (24h)';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_instagram_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_instagram_cache_updated_at
    BEFORE UPDATE ON instagram_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_instagram_cache_updated_at();

-- Inserir entrada inicial com dados de fallback
INSERT INTO instagram_cache (
    id,
    username,
    posts,
    source,
    fetched_at,
    expires_at
) VALUES (
    'saraiva_vision_cache',
    'saraiva_vision',
    '[
        {
            "id": "initial_post_1",
            "username": "saraiva_vision",
            "caption": "🔬 Bem-vindos à Clínica Saraiva Vision! Especializados em oftalmologia com tecnologia de ponta para cuidar da sua visão. #SaraivaVision #SaudeOcular #Oftalmologia #Brasilia",
            "imageUrl": "/images/hero.webp",
            "timestamp": "2024-09-23T10:00:00.000Z",
            "likes": 95,
            "comments": 18,
            "type": "image",
            "hashtags": ["#SaraivaVision", "#SaudeOcular", "#Oftalmologia", "#Brasilia"],
            "postUrl": "https://www.instagram.com/saraiva_vision/",
            "profilePicture": "/images/drphilipe_perfil.webp",
            "isVerified": true,
            "source": "initial"
        },
        {
            "id": "initial_post_2",
            "username": "saraiva_vision", 
            "caption": "👨‍⚕️ Dr. Philipe Saraiva Cruz, oftalmologista dedicado a proporcionar o melhor cuidado para sua visão. Agende sua consulta! #DrPhilipe #AtendimentoHumanizado #EspecialistaVisao",
            "imageUrl": "/images/drphilipe_perfil.webp",
            "timestamp": "2024-09-22T14:30:00.000Z",
            "likes": 127,
            "comments": 24,
            "type": "image", 
            "hashtags": ["#DrPhilipe", "#AtendimentoHumanizado", "#EspecialistaVisao"],
            "postUrl": "https://www.instagram.com/saraiva_vision/",
            "profilePicture": "/images/drphilipe_perfil.webp",
            "isVerified": true,
            "source": "initial"
        }
    ]'::jsonb,
    'initial_setup',
    NOW(),
    NOW() + INTERVAL '24 hours'
) ON CONFLICT (id) DO NOTHING;

-- Comentário final
COMMENT ON TABLE instagram_cache IS 'Cache persistente para posts do Instagram da Saraiva Vision com dados reais atualizados via cron job a cada 24h';