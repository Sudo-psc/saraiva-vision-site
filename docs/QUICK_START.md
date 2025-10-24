# Quick Start Guide - Saraiva Vision

Get up and running with the Saraiva Vision medical website project in minutes.

## Prerequisites

- **Node.js 22+** (required by package.json engines)
- **Git** for version control
- **Code editor** (VS Code recommended)
- **Terminal/Command Line** access

## 🚀 Development Setup (5 minutes)

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/Sudo-psc/saraiva-vision-site.git
cd saraiva-vision-site

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server
```bash
# Start with hot reload (port 3002)
npm run dev

# Open in browser
open http://localhost:3002
```

### 4. Verify Setup
- ✅ Site loads at http://localhost:3002
- ✅ No console errors in browser
- ✅ Services page displays correctly
- ✅ Contact form is functional

## 🏗️ VPS Deployment (10 minutes)

### Prerequisites
- Ubuntu 20.04+ or Debian 11+ VPS
- Root or sudo access
- Domain pointing to VPS IP

### 1. Automated VPS Setup
```bash
# On your VPS server
wget https://raw.githubusercontent.com/Sudo-psc/saraiva-vision-site/main/setup-vps-native.sh
chmod +x setup-vps-native.sh
sudo ./setup-vps-native.sh
```

### 2. Deploy Application
```bash
# From your local development machine
npm run build
./deploy-vps-native.sh
```

### 3. Verify Deployment
```bash
# Check services status
sudo systemctl status nginx saraiva-api redis

# Test website
curl -f https://yourdomain.com
```

## 📋 Essential Commands

### Development
```bash
npm run dev              # Start development server
npm run build:vite       # Production build (Vite)
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Code quality check
```

### Testing
```bash
npm run test:run         # Run all tests once
npm run test:coverage    # Generate coverage report
npm run test:api         # Test API endpoints only
npm run test:frontend    # Test React components only
```

### Deployment
```bash
npm run deploy           # Full deployment process
npm run deploy:health    # Health check after deployment
```

## 🔧 Common Tasks

### Adding a New Page
```jsx
// 1. Create page component
// src/pages/NewPage.jsx
import React from 'react';

function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">New Page</h1>
    </div>
  );
}

export default NewPage;
```

```jsx
// 2. Add route in App.jsx
const NewPage = lazy(() => import('./pages/NewPage.jsx'));

// In routes section:
<Route path="/new-page" element={<NewPage />} />
```

### Adding Environment Variables
```bash
# 1. Add to .env files
echo "VITE_NEW_API_KEY=your_key" >> .env
echo "VITE_NEW_API_KEY=production_key" >> .env.production

# 2. Use in code
const apiKey = import.meta.env.VITE_NEW_API_KEY;
```

### Database Operations
```javascript
// Contact form submission using Node.js API
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Patient Name',
    email: 'patient@email.com',
    message: 'Appointment request'
  }),
});

const result = await response.json();
```

### Blog Posts (Static Data)
```javascript
// Blog posts are static data in src/data/blogPosts.js
import { blogPosts } from './data/blogPosts.js';

// Get all posts
const posts = blogPosts;

// Filter by category
const filteredPosts = blogPosts.filter(post => post.category === 'Saúde Ocular');
```

## 🐛 Quick Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Development Server Issues
```bash
# Check port availability
lsof -i :3002

# Restart with different port
npm run dev -- --port 3003
```

### VPS Service Issues
```bash
# Check all services
sudo systemctl status nginx saraiva-api redis

# Restart failed services
sudo systemctl restart nginx saraiva-api

# Check logs
sudo journalctl -u saraiva-api -f
```

### API Connection Issues
```bash
# Test Node.js API health
curl http://localhost:3001/api/health

# Test Redis cache
redis-cli ping
```

## 📚 Next Steps

### For Developers
1. **Read Architecture**: [Architecture Documentation](./PROJECT_DOCUMENTATION.md#architecture--technology-stack)
2. **Component System**: [Component Documentation](./PROJECT_DOCUMENTATION.md#component-system)
3. **Testing Strategy**: [Testing Documentation](./PROJECT_DOCUMENTATION.md#development-workflows)

### For DevOps
1. **Monitoring Setup**: [Monitoring Documentation](./PROJECT_DOCUMENTATION.md#maintenance--monitoring)
2. **Security Configuration**: [Security Documentation](./PROJECT_DOCUMENTATION.md#troubleshooting)
3. **Backup Procedures**: [Backup Documentation](./PROJECT_DOCUMENTATION.md#deployment-guide)

### For Content Managers
1. **Blog Content**: Edit static data in `src/data/blogPosts.js`
2. **Content Guidelines**: Follow CFM compliance requirements
3. **Blog Management**: All content is version-controlled in Git

## 🆘 Get Help

### Documentation
- **[Complete Documentation](./PROJECT_DOCUMENTATION.md)** - Comprehensive guide
- **[Troubleshooting](./PROJECT_DOCUMENTATION.md#troubleshooting)** - Common issues
- **[VPS Deployment](../NATIVE_VPS_DEPLOYMENT.md)** - Deployment guide

### Emergency Procedures
```bash
# Site down emergency recovery
./emergency-recovery.sh

# Cache issues
sudo systemctl restart redis

# SSL certificate renewal
sudo certbot renew --force-renewal
```

### Support Contacts
- **Repository**: [GitHub Issues](https://github.com/Sudo-psc/saraiva-vision-site/issues)
- **Documentation**: This docs/ directory
- **Live Site**: [https://saraivavision.com.br](https://saraivavision.com.br)

---

*This quick start guide gets you productive immediately. For detailed information, consult the complete PROJECT_DOCUMENTATION.md file.*