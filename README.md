<p align="center">

```
┌─────────────────────────────────────┐
│                                     │
│       [ LOGO COMING SOON ]          │
│                                     │
└─────────────────────────────────────┘
```

</p>

<h1 align="center"><strong>Vestum</strong></h1>

<p align="center">
  Your AI color theorist and smart digital wardrobe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Palette-Rose%20Mist-D7A5B9?style=flat-square" alt="Rose Mist" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-React%20Native-61DAFB?style=flat-square&logo=react&logoColor=white" alt="Built with React Native" />
  <img src="https://img.shields.io/badge/Powered%20by-Expo-000020?style=flat-square&logo=expo&logoColor=white" alt="Powered by Expo" />
  <img src="https://img.shields.io/badge/AI%20by-Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white" alt="AI by Google Gemini" />
  <img src="https://img.shields.io/badge/Version-1.0.0-D7A5B9?style=flat-square" alt="Version 1.0.0" />
</p>

---

## Overview

Vestum is an AI-powered fashion and wardrobe assistant that helps you dress with confidence. Analyze your skin tone, hair, and eyes to discover your perfect seasonal color palette, build a digital closet, and get weather-aware outfit suggestions powered by Google Gemini.

Built for anyone who wants smarter style decisions without the guesswork.

## Features

- **Color AI** — Selfie analysis for seasonal color palette with hex codes
- **Digital Wardrobe** — Upload clothes via camera, auto-categorize with AI
- **Daily Outfit** — Weather-based recommendations avoiding items worn in the last 7 days
- **Wardrobe Stats** — Track never-worn percentage and out-of-season items to sell or donate
- **Shopping Suggestions** — AI identifies missing pieces that unlock new outfits
- **Rose Mist design system** — premium JPH ecosystem aesthetic
- **JPH splash screen** — custom boot animation with shark logo
- **Onboarding flow** — three-slide intro to Color AI, Wardrobe, and daily outfits

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Mobile** | React Native, Expo SDK 54, TypeScript (strict) |
| **Navigation** | Expo Router (bottom tabs) |
| **Styling** | NativeWind (Tailwind CSS) |
| **AI** | Google Gemini API (`gemini-2.5-flash`) |
| **Storage** | AsyncStorage (local persistence) |
| **Icons** | Lucide React Native (stroke 1.5px) |
| **Theme** | Rose Mist — `src/themes/vestum.theme.ts` |

## Getting Started

**Prerequisites:** Node.js 20+, npm, and an Expo Go app or simulator.

```bash
# Clone the repository
git clone https://github.com/PhilipHim/vestum.git
cd vestum

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in the values described below

# Start the development server
npm start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for color analysis and outfit logic |
| `EXPO_PUBLIC_GEMINI_MODEL` | Gemini model name (default: `gemini-2.5-flash`) |

## JPH Product Studio

Vestum is part of the [JPH Product Studio](https://github.com/PhilipHim) ecosystem — a collection of thoughtfully designed, AI-powered apps built with consistent Atlas UI theming, premium UX, and intentional craft.

Each JPH product ships with its own accent palette while sharing core design tokens, loading screens, feedback flows, and onboarding patterns.

## License

MIT
