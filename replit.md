# ThisSongThatTime - Musical Memory Platform

## Overview

ThisSongThatTime is a full-stack web application that allows users to share personal stories and memories connected to songs. Users can search for songs, create detailed narratives about their musical memories, and discover stories from other users. The platform combines music discovery with storytelling to create a community around shared musical experiences.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based (infrastructure in place)
- **External APIs**: Spotify Web API for music search and metadata

### Database Layer
- **ORM**: Drizzle with type-safe schema definitions
- **Database**: PostgreSQL (Neon serverless in production)
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Core Data Models
- **Users**: Basic user profiles with display names and avatars
- **Songs**: Music metadata from Spotify (title, artist, album, year, genre, preview URLs)
- **Stories**: User-generated content with rich story fields and optional prompts
- **Social Features**: Likes, comments, and follows for community engagement

### Story Creation System
- **Song Search**: Integrated Spotify search with real-time results
- **Enhanced Form**: Structured prompts for capturing detailed memories
- **AI Enhancement**: OpenAI integration for story generation assistance
- **Multi-format Support**: Text input with planned audio transcription

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component System**: Reusable UI components via shadcn/ui
- **Interactive Elements**: Music preview players, share buttons, rich forms
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

### Story Creation Flow
1. User searches for a song via Spotify API
2. Song metadata is stored in local database
3. User fills out story form with structured prompts
4. Optional AI enhancement generates polished narrative
5. Story is saved as draft or published immediately
6. Published stories appear in community discovery feed

### Music Integration Flow
1. Client requests song search through backend API
2. Backend authenticates with Spotify using client credentials
3. Spotify results are transformed and cached in database
4. Preview URLs and metadata are served to frontend
5. Users can play 30-second previews directly in browser

### Social Interaction Flow
1. Users can like/unlike stories with optimistic updates
2. Comments are stored with user associations
3. Share functionality generates rich preview cards
4. Follow system tracks user relationships

## External Dependencies

### Music Services
- **Spotify Web API**: Primary source for music metadata and search
- **Preview Playback**: Spotify-provided 30-second audio clips
- **Future Integration**: Apple Music and YouTube support planned

### AI Services
- **OpenAI GPT-4**: Story enhancement and generation
- **Whisper API**: Audio transcription (implemented but not active)

### Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **SendGrid**: Email service integration (configured but not active)
- **Replit**: Development and deployment platform

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express API proxy
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Local .env file for API keys

### Production Deployment
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Server**: Single Express server serving static assets and API
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Scaling**: Replit autoscale deployment target

### Environment Configuration
- Required: `DATABASE_URL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- Optional: `OPENAI_API_KEY` for AI features
- Development: Additional debugging and hot-reload configuration

## User Preferences

Preferred communication style: Simple, everyday language.
Music Player: Removed preview functionality and external music app links due to buggy behavior that was degrading user experience.

## Changelog

Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Removed music preview player and external music app links to improve user experience