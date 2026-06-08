# Adamas CR Voting System

A web-based Class Representative voting application built for Adamas University. The system helps students verify their identity, cast one secure vote, and view election results while giving administrators tools to manage candidates and election settings.

## Features

- Email-based student verification for eligible voters
- Role-based access for voters and administrators
- Protected voting and admin routes
- Candidate voting interface
- Admin dashboard for candidates, voters, settings, and results
- Live result display with vote distribution charts
- Election status controls for opening or closing voting
- CSV export for election results

## Tech Stack

- React, TypeScript, and Vite
- React Router v6
- Tailwind CSS and Radix UI
- React Context API
- TanStack Query
- Firebase
- Recharts
- Bun or npm
- Vercel deployment support

## Getting Started

```sh
npm install
npm run dev
```

Create a `.env` file in the project root and add the required Firebase configuration values before running the app in a real environment.

## Usage

- Students verify with an Adamas University email address, then cast their vote for a CR candidate.
- Administrators use the admin panel to add candidates, monitor turnout, update election settings, and export results.

## License

This project is open-source under the MIT License.
