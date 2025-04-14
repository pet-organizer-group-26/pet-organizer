# Pet Organizer

Pet Organizer is a comprehensive mobile application built with Expo and React Native that helps pet owners manage all aspects of pet care.

## Features

- **Calendar Management**: Schedule and manage pet-related events with recurring options
- **Pet Profiles**: Store important information about your pets
- **Expense Tracking**: Track and categorize all pet-related expenses
- **Shopping List**: Manage shopping lists for pet supplies
- **Emergency Contacts**: Store important contact information for veterinarians and pet services

## Tech Stack

- Expo & React Native
- TypeScript
- Supabase for backend (authentication and database)
- React Navigation for routing
- Expo Notifications for reminders
- Custom theming system

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Run on a device or emulator

   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

## Development

### Project Structure

- `/app`: Main application screens using Expo Router
- `/components`: Reusable UI components
- `/context`: React Context providers
- `/constants`: Application constants and theme
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and services

### Database Schema

The application uses Supabase as the backend database with the following primary tables:

- `events`: Calendar events and appointments
- `pets`: Pet information and details
- `expenses`: Pet-related expenses
- `shopping_items`: Shopping list items
- `emergency_contacts`: Important contact information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License.
