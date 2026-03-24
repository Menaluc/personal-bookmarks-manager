# Personal Bookmarks Manager

A full-stack web application for saving, organizing, and managing bookmarks with tags.

## Overview

Personal Bookmarks Manager allows users to add, edit, delete, search, and organize bookmarks with tags, while automatically fetching metadata such as title, description, and favicon.

The app was built as a full-stack project with a React frontend, Express backend, and SQLite database.

## Features

- Add bookmarks by URL
- Automatically fetch metadata from the target page:
  - title
  - description
  - favicon
- Organize bookmarks with tags
- Search bookmarks by title, description, or URL
- Filter bookmarks by tag
- Edit bookmarks 
- Delete bookmarks
- Responsive UI for desktop and mobile
- Persistent storage using SQLite

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express

### Database
- SQLite
- better-sqlite3

## Project Structure

```bash
client/   # React frontend
server/   # Express backend
```

## API Endpoints
### Health

- GET /api/health


### Bookmarks
- GET /api/bookmarks
- POST /api/bookmarks
- PUT /api/bookmarks/:id
- DELETE /api/bookmarks/:id

### Tags
- GET /api/tags

## Database Schema
### bookmarks
- id
- url
- title
- description
- favicon
- created_at

### tags
- id
- name

### bookmark_tags
- bookmark_id
- tag_id

## Local Development
1. #### Install dependencies
```
npm install
npm install --prefix client
npm install --prefix server
```

2. #### Run the backend
``
npm start --prefix server
``

3. #### Run the frontend
npm run dev --prefix client


## Production Build
From the project root:
```
npm run build
```
This builds the frontend and copies the production files into server/public.

## Environment Variables

For local frontend development, create a file named:
```
client/.env
```
With:
```
VITE_API_BASE_URL=http://localhost:4000/api
```
In production, the app can use /api when frontend and backend are served from the same domain.

## Error Handling

The app includes handling for common issues such as:

invalid URLs
metadata fetch failures
duplicate bookmarks
API request failures

## Deployment

The project is deployed on Railway.

## Current Functionality

The application currently supports the complete core flow end-to-end:

- adding bookmarks
- editing bookmarks
- automatic metadata fetching
- tag organization
- searching
- filtering
- deleting
- persistent database storage

## Future Improvements

- Improve user feedback for actions and errors
- Add success notifications
- Improve form validation
- Enhance bookmark card design and UX polish

## Development Notes

During the development of this assignment, Cursor AI was used as a supporting tool mainly for debugging, code improvement, and speeding up the development process, while the final solution was manually reviewed, understood, and integrated.

Author

GitHub: Menaluc

