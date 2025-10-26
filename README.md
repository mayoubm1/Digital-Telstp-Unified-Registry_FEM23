# TELsTP OmniCognitor Frontend

A beautiful, responsive React dashboard for the TELsTP OmniCognitor unified AI platform.

## Features

- ✅ Real-time dashboard
- ✅ AI platform management
- ✅ Workspace overview
- ✅ Message history
- ✅ Database statistics
- ✅ Dark theme with Tailwind CSS
- ✅ Responsive design
- ✅ TypeScript support

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment Variables

```
VITE_API_URL=http://localhost:3000/api
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy
```

### Other Platforms

The `dist/` folder contains the production build and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Google Cloud Storage
- Any static hosting service

## Architecture

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Language**: TypeScript

## API Integration

The frontend connects to the backend API at:
- Development: `http://localhost:3000/api`
- Production: Set via `VITE_API_URL` environment variable

## License

MIT
