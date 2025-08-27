# Deployment Guide

## Overview
This guide covers deploying the Stone Slab Inventory Management System to Cloudflare Pages.

## Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Cloudflare account
- GitHub repository

## Environment Variables

### Required Environment Variables
Set these in your Cloudflare Pages dashboard:

\`\`\`bash
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BUILD_TIME=2024-01-01T00:00:00Z
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ERROR_REPORTING_ENABLED=true
NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_API_BASE_URL=https://your-domain.pages.dev
NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY=your-32-character-encryption-key
\`\`\`

### Generating Encryption Key
\`\`\`bash
# Generate a secure 32-character key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
\`\`\`

## Cloudflare Pages Setup

### 1. Create New Project
1. Log into Cloudflare Dashboard
2. Go to Pages section
3. Click "Create a project"
4. Connect your GitHub repository

### 2. Build Configuration
- **Framework preset:** Next.js
- **Build command:** `npm run build:production`
- **Build output directory:** `out`
- **Root directory:** `/` (default)

### 3. Environment Variables
Add all required environment variables in the Pages dashboard under Settings > Environment variables.

### 4. Custom Domain (Optional)
1. Go to Custom domains tab
2. Add your domain
3. Update DNS records as instructed

## Build Process

### Local Development
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build:production
\`\`\`

### Production Build
The production build includes:
- Static optimization
- Bundle analysis
- PWA service worker generation
- Asset compression
- Security headers

### Build Verification
\`\`\`bash
# Run full test suite before deployment
npm run test:build
\`\`\`

## Deployment Process

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Build status reported back to GitHub

### Manual Deployment
\`\`\`bash
# Deploy preview
npm run deploy:preview

# Deploy to production
npm run deploy:production
\`\`\`

## Post-Deployment Checklist

### Functionality Testing
- [ ] Application loads correctly
- [ ] All pages accessible
- [ ] Forms submit properly
- [ ] Data persistence works
- [ ] PWA installation works
- [ ] Offline functionality works

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data exposed
- [ ] CSP headers configured

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Feature Testing
- [ ] Slab management CRUD operations
- [ ] Filtering and search
- [ ] Bulk operations
- [ ] Reports generation
- [ ] Settings management
- [ ] Help system

## Monitoring

### Analytics
- Page views and user interactions tracked
- Performance metrics collected
- Error reporting enabled

### Error Monitoring
- JavaScript errors captured
- Network failures logged
- User feedback collected

### Performance Monitoring
- Core Web Vitals tracked
- Bundle size monitored
- Load times measured

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (18+)
- Verify all dependencies installed
- Run type check locally
- Check for linting errors

#### Runtime Errors
- Check browser console
- Verify environment variables
- Check network requests
- Review error logs

#### Performance Issues
- Analyze bundle size
- Check for memory leaks
- Optimize images
- Review lazy loading

### Support
For deployment issues:
1. Check build logs in Cloudflare Pages
2. Review GitHub Actions logs
3. Test locally with production build
4. Contact support if needed

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor performance metrics
- Review error logs weekly
- Update documentation as needed

### Security Updates
- Apply security patches promptly
- Review and update CSP headers
- Rotate encryption keys annually
- Monitor for vulnerabilities
