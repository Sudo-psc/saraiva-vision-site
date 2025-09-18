# Enable Local Git Hooks

To enable the pre-commit secret guard locally:

1) Point your repo to use the hooks in `.githooks/`:

```
git config core.hooksPath .githooks
```

2) Make the hooks executable:

```
chmod +x .githooks/pre-commit tools/pre-commit-guard.sh
```

3) Test it by attempting to commit a file containing a fake secret (it should block):

```
echo "RECAPTCHA_SECRET=bad-idea" > secrets.txt
git add secrets.txt && git commit -m "test"
# Expect: commit blocked
git reset HEAD secrets.txt && rm secrets.txt
```

To bypass temporarily (not recommended): `git commit --no-verify`.

