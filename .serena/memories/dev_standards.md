# Dev Standards

## Arquitetura
```
User → Nginx (31.97.129.78)
  ├─ Static: /var/www/html/ (React SPA)
  ├─ API Proxy: /api/* → Node.js Express
  └─ WordPress: /wp-json/* → cms.saraivavision.com.br
```

## File Structure
```
src/
├── components/      # React components (PascalCase.jsx)
├── pages/          # Rotas lazy loading
├── hooks/          # Custom hooks (camelCase.js)
├── lib/            # Utils + LGPD
├── data/           # blogPosts.js (dados estáticos)
└── __tests__/      # Testes co-localizados
```

## Convenções
- **Componentes**: PascalCase (`ContactForm.jsx`)
- **Hooks/Utils**: camelCase (`useAuth.js`)
- **Testes**: `.test.js/.jsx` ou `__tests__/`
- **Imports**: `@/` alias para `src/`
- **TypeScript**: `strict: false` (compatibilidade)

## Workflow
1. **Read** código existente primeiro
2. **Plan** mudanças (TodoWrite se >3 steps)
3. **Execute** com validação local
4. **Test** antes de commit
5. **Document** se significativo

## Git
- Feature branches sempre (nunca main/master direto)
- Commits: `type(scope): description`
- `git status` antes de commits
- Nunca auto-commit sem review

## Deploy Process
1. Build local: `npm run build`
2. No VPS: `bash scripts/deploy-production.sh`
3. Script auto: backup → test → copy → reload
4. Zero downtime + rollback capability