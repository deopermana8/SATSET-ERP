# POS Wisata Admin Dashboard

Welcome to the POS Wisata Admin Dashboard project! This application is built using Next.js 15 with TypeScript, Tailwind CSS, and various modern libraries to create a robust and maintainable admin interface for managing categories and other features.

## Project Structure

The project is organized into several directories and files, each serving a specific purpose:

- **apps/admin**: Contains the admin application code.
  - **app**: The main application files, including dashboard and layout components.
    - **(dashboard)**: Contains the dashboard-related components and pages.
      - **category**: The category management section of the dashboard.
        - `page.tsx`: Entry point for the category dashboard.
      - `layout.tsx`: Layout for the dashboard, including navigation and shared components.
  - **components**: Reusable UI and form components.
    - **ui**: General UI components like buttons and modals.
    - **forms**: Form components with validation using React Hook Form and Zod.
    - **layout**: Layout components such as headers and sidebars.
  - **features**: Specific features of the application.
    - **categories**: Contains components, hooks, schemas, and services related to category management.
      - **components**: Specific components for categories like `CategoryTable` and `CategoryForm`.
      - **hooks**: Custom hooks for managing category data.
      - **schemas**: Zod schemas for validating category data.
      - **services**: API services for category operations.
  - **hooks**: Shared hooks for use across the application.
  - **lib**: Utility functions and API interactions.
    - **api**: API utility functions for backend requests.
    - **utils**: General utility functions.
    - **validations**: Validation functions and schemas.
  - **providers**: Context providers for global state management.
  - **styles**: Additional styles specific to components or features.
  - `globals.css`: Global styles including Tailwind CSS configurations.
  - `layout.tsx`: Main layout for the admin application.
  - `package.json`: Lists dependencies and scripts for the admin application.
  - `tsconfig.json`: TypeScript configuration file.
  - `next.config.ts`: Next.js configuration settings.
  - `README.md`: Documentation for the admin application.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the admin application directory:
   ```
   cd apps/admin
   ```

3. Install dependencies:
   ```
   pnpm install
   ```

4. Run the development server:
   ```
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Features

- **Category Management**: Easily manage categories with a dedicated dashboard.
- **Reusable Components**: Built with reusable components for maintainability.
- **Form Validation**: Utilizes React Hook Form and Zod for robust form handling and validation.
- **Responsive Design**: Tailwind CSS ensures a responsive and modern UI.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.