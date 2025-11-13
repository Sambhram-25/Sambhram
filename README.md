# Sambhram - Event Management Platform

A modern, responsive web application for managing and showcasing college events. Built with React and Vite, Sambhram provides an intuitive interface for event browsing, registration, and ticketing.

## Features

- **Event Discovery**: Browse technical, cultural, and special events with detailed information
- **Flip Card Animation**: Interactive event cards with flip animations to view descriptions and rules
- **Event Registration**: Easy registration system with team support for group events
- **Ticket Management**: View and manage registered event tickets
- **Responsive Design**: Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Event Filtering**: Filter events by category (Technical, Cultural, Special)
- **Search & Navigation**: Intuitive navigation with smooth scrolling

## Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite with HMR (Hot Module Replacement)
- **Styling**: Tailwind CSS + Custom CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Notifications**: React Toastify
- **Icons**: FontAwesome

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sambhram-25/Sambhram.git
cd Sambhram
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── Components/          # Reusable UI components
│   ├── EventCard/      # Event card with flip animation
│   ├── Navbar/         # Navigation bar
│   ├── Footer/         # Footer component
│   └── ...other components
├── Pages/              # Page components
│   ├── Home/          # Landing page
│   ├── Events/        # Events listing
│   ├── Checkout/      # Registration checkout
│   ├── OurTeam/       # Team page
│   └── ...other pages
├── Contexts/          # React context providers
├── utils/             # Utility functions
└── App.jsx           # Main application component
```

## Key Components

### EventCard
Interactive flip card component displaying event information with smooth 3D animations.

### Navbar
Responsive navigation bar with smooth scrolling effects and active menu indicators.

### EventPopup
Modal popup for event rules, team registration, and additional event details.

## Pages

- **Home**: Landing page with featured events and carousel
- **Events**: Complete event listing with filtering options
- **Checkout**: Registration and payment processing
- **About**: Information about Sambhram
- **Our Team**: Meet the organizing team
- **Contact**: Get in touch page
- **Verify Ticket**: Ticket verification system

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is part of the Sambhram event management initiative.

## Contact & Support

For issues, suggestions, or support, please reach out to the team or open an issue on GitHub.
