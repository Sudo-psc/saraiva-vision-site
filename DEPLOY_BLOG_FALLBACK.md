# 🚀 Deploy Manual: Blog Fallback System

**Feature:** Graceful blog fallback with 5 realistic preview posts
**Status:** ✅ Build completed, ready for VPS deployment
**Branch:** `external-wordpress`
**Commit:** `ba220f18`

---

## 📋 Deployment Steps

### 1️⃣ **SSH Access to VPS**
```bash
ssh root@31.97.129.78
```

### 2️⃣ **Create Backup (Safety First)**
```bash
cd /var/www/html
sudo tar -czf /tmp/saraiva-backup-$(date +%Y%m%d-%H%M%S).tar.gz .
ls -lh /tmp/saraiva-backup-*.tar.gz
```

### 3️⃣ **Upload Build Files**

**Option A: Using rsync (Recommended)**
```bash
# From local machine (where you have SSH key)
rsync -avz --progress \
  --exclude='*.map' \
  /home/saraiva-vision-site/dist/ \
  root@31.97.129.78:/tmp/saraiva-dist-new/
```

**Option B: Using scp**
```bash
# From local machine
cd /home/saraiva-vision-site
scp -r dist/* root@31.97.129.78:/tmp/saraiva-dist-new/
```

**Option C: Git pull on VPS**
```bash
# On VPS
cd /opt/saraiva-vision-source  # or wherever you have the repo
git fetch origin
git checkout external-wordpress
git pull origin external-wordpress
npm install
npm run build
```

### 4️⃣ **Deploy to Web Directory (On VPS)**
```bash
# On VPS as root
cd /tmp/saraiva-dist-new
sudo rsync -av --delete ./ /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
rm -rf /tmp/saraiva-dist-new
```

### 5️⃣ **Reload Nginx**
```bash
# On VPS
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager | head -15
```

### 6️⃣ **Verify Deployment**
```bash
# Check file permissions
ls -lah /var/www/html/index.html

# Test Nginx configuration
sudo nginx -t

# Check if site is accessible
curl -I https://saraivavision.com.br
```

---

## 🧪 Testing

### Test URLs
1. **Blog page:** https://saraivavision.com.br/blog
2. **Individual fallback post:** https://saraivavision.com.br/blog/cuidados-visao-digital

### Expected Behavior

**When WordPress API is DOWN:**
- ✅ Blue banner appears: "Conteúdo de Prévia Disponível"
- ✅ 5 preview posts displayed with images from Unsplash
- ✅ "Tentar Reconectar" button visible
- ✅ Educational content about eye health
- ✅ Help text at bottom explaining preview mode

**When WordPress API is UP:**
- ✅ Normal blog posts load from CMS
- ✅ No fallback banner
- ✅ Full post grid with categories

---

## 🔍 Troubleshooting

### Issue: Permission Denied
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### Issue: Nginx 502 Bad Gateway
```bash
sudo systemctl status nginx
sudo journalctl -u nginx -n 50
sudo nginx -t
```

### Issue: Files Not Updating
```bash
# Clear browser cache
# Check file timestamps
ls -lt /var/www/html/assets/*.js | head -5

# Force reload Nginx
sudo systemctl restart nginx
```

---

## 📊 What Changed

### Files Modified
- `src/lib/wordpress-compat.js` - Added 5 fallback posts
- `src/pages/BlogPage.jsx` - Enhanced fallback UI

### New Features
- 5 realistic medical preview posts with:
  * Eye health topics (digital vision, cataract, exams, glaucoma, contacts)
  * Educational excerpts and content
  * Unsplash medical images
  * Proper categories and dates
- Beautiful gradient banner (blue/indigo)
- Clear reconnection button
- Consistent post card layout
- Helpful explanatory text

---

## 🎯 Success Criteria

- [ ] Build completed successfully
- [ ] Files uploaded to VPS
- [ ] Nginx reloaded without errors
- [ ] Blog page loads without errors
- [ ] Fallback posts appear when API is down
- [ ] Images load from Unsplash
- [ ] Retry button works
- [ ] Normal posts load when API is up

---

## 📞 Rollback Plan (If Needed)

```bash
# On VPS
cd /var/www/html
sudo rm -rf ./*
sudo tar -xzf /tmp/saraiva-backup-YYYYMMDD-HHMMSS.tar.gz .
sudo systemctl reload nginx
```

---

## ✅ Post-Deployment Checklist

1. [ ] Test blog page with API down (simulate by blocking cms.saraivavision.com.br)
2. [ ] Verify 5 fallback posts display correctly
3. [ ] Check images load from Unsplash
4. [ ] Test reconnection button
5. [ ] Verify normal blog loads when API is up
6. [ ] Check browser console for errors
7. [ ] Test on mobile devices
8. [ ] Verify SEO meta tags intact

---

**Build Size:** 6.4MB
**Build Time:** 22 seconds
**Deployment Status:** Ready ✅
**Last Updated:** 2025-09-29 19:23 UTC