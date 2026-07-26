# Admin Application for POS Wisata

This README provides an overview of the Admin application for the POS Wisata project, detailing its structure, features, and setup instructions.

## Project Structure

The Admin application is organized into several key directories:

- **app/**: Contains the main application files, including pages and layout components.
  - **(dashboard)/**: Houses the dashboard-related components and pages.
    - **category/**: Contains the category management page.
- **components/**: Reusable UI components, forms, and layout components.
- **features/**: Specific features related to categories, including components, hooks, schemas, and services.
- **hooks/**: Shared hooks for managing state and side effects.
- **lib/**: Utility functions, API calls, and validation schemas.
- **providers/**: Context providers for global state management.
- **styles/**: Additional styles specific to components or features.

## Technologies Used

- **Next.js 15**: A React framework for building server-rendered applications.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **TanStack Query**: A powerful data-fetching library for React.
- **React Hook Form**: A library for managing form state and validation.
- **Zod**: A TypeScript-first schema declaration and validation library.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd pos-wisata
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run the Development Server**:
   ```bash
   pnpm dev
   ```

4. **Open the Application**:
   Navigate to `http://localhost:3000` in your browser.

## Features

- **Category Management**: Create, read, update, and delete categories.
- **Responsive Design**: The application is designed to be responsive and user-friendly.
- **Form Validation**: All forms utilize React Hook Form with Zod for validation.
- **Data Fetching**: Utilizes TanStack Query for efficient data fetching and caching.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.