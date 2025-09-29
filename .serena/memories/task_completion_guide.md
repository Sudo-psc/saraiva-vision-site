# Task Workflow

## Development Pattern
1. **Read** existing code first
2. **Plan** changes (TodoWrite if >3 steps)
3. **Execute** with validation
4. **Test** locally
5. **Document** if significant

## Deployment Pattern
1. Correct code/config
2. Build: `npm run build`
3. Review changes
4. Deploy on VPS: `bash scripts/deploy-production.sh`
5. Verify health checks

## Git Workflow
- Feature branches for all work
- Conventional commits: `type(scope): description`
- Never commit to main/master directly
- Always `git status` before commits