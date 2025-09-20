# DNS Configuration Instructions - REQUIRED ACTION

## You must complete these steps in your Cloudflare account

### 🚨 IMPORTANT: Read before proceeding

Your website cannot proceed with SSL certificate installation until these DNS changes are made.

### 📋 Current Status
- **Domain**: saraivavision.com.br
- **Current DNS**: Points to Cloudflare proxy (104.21.83.178, 172.67.180.121)
- **Target Server IP**: 31.97.129.78
- **Issue**: SSL validation fails through Cloudflare proxy

### 🔧 Required DNS Changes in Cloudflare

#### Step 1: Log into Cloudflare
1. Go to https://dash.cloudflare.com
2. Log in with your credentials
3. Select the domain: **saraivavision.com.br**

#### Step 2: Update DNS Records

**🔸 Record 1 - Root Domain (@):**
- **Type**: A
- **Name**: @
- **Content**: 31.97.129.78
- **TTL**: Auto
- **Proxy status**: DNS only (⚫️ Gray cloud - DISABLED)

**🔸 Record 2 - WWW Subdomain:**
- **Type**: A
- **Name**: www
- **Content**: 31.97.129.78
- **TTL**: Auto
- **Proxy status**: DNS only (⚫️ Gray cloud - DISABLED)

#### Step 3: Remove Existing Records (if any)
Delete any existing A records that point to different IPs

### ⏱️ After Making Changes
- Wait 5-10 minutes for DNS propagation
- Run the setup script (I'll guide you through this)
- SSL certificates will be automatically installed

### ✅ How to Verify DNS Changes
After updating, run this command:
```bash
nslookup saraivavision.com.br
```

Should return: `31.97.129.78`

### 🚨 Why This is Necessary
- Let's Encrypt needs direct access to your server for SSL validation
- Cloudflare proxy blocks direct access, causing 521 errors
- Temporary DNS-only mode allows SSL installation
- After SSL installation, we'll re-enable Cloudflare proxy

### 📞 Need Help?
- Cloudflare Support: https://support.cloudflare.com
- Cloudflare Community: https://community.cloudflare.com

---

## 🚀 Next Steps After DNS Update

1. **Confirm DNS changes are live** (wait 5-10 minutes)
2. **Run the automated SSL setup** (I'll provide the command)
3. **Verify SSL installation**
4. **Re-enable Cloudflare proxy** with Full SSL mode

### ⚡ Quick Commands for After DNS Update
```bash
# Test DNS propagation
nslookup saraivavision.com.br

# Run SSL setup (after DNS is updated)
./setup-cloudflare-ssl.sh

# Test final configuration
./test-cloudflare-setup.sh
```

---

## 📝 Current Setup Status
✅ All Docker services running and healthy
✅ Nginx configured for SSL
✅ SSL setup scripts ready
⏳ **Awaiting your DNS configuration in Cloudflare**
⏳ SSL certificate installation pending

---

**Once you complete the DNS changes above, let me know and I'll proceed with the automated SSL installation!**