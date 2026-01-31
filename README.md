# OrderIQ 📋
**Smart Order Extraction System** – Automatically extract structured order data from emails and faxes

---

## Overview

OrderIQ is a full-stack application designed to streamline order processing by automatically extracting and structuring order information from unstructured sources like emails and fax documents. The system converts raw order data into clean, structured Excel formats for easy integration with your workflow.

### Key Features

- 📧 **Email & Document Processing** – Extract orders from email content or uploaded documents
- 📊 **Structured Data Export** – Output organized order data in Excel format
- 🎨 **User-Friendly Interface** – Intuitive React-based UI for easy order management
- ⚡ **Fast Processing** – Powered by Python backend for efficient data extraction
- 📁 **Multiple Input Methods** – Text input or file upload for flexibility

---

## Project Structure

```
OrderIQ/
├── backend/              # Python backend server
│   ├── main.py          # Flask/FastAPI server entry point
│   ├── requirements.txt  # Python dependencies
│   └── outputs/         # Generated Excel files
│
├── frontend/            # React web application
│   ├── public/          # Static assets
│   ├── src/             # React components
│   ├── package.json     # Node dependencies
│   └── README.md        # Frontend-specific docs
│
└── README.md           # This file
```

---

## Tech Stack

### Frontend
- **React** – UI library for interactive components
- **Axios** – HTTP client for API communication
- **Bootstrap/CSS** – Styling and responsive design

### Backend
- **Python** – Core processing logic
- **Flask/FastAPI** – Web framework
- Additional libraries for document parsing and Excel generation

---

## Getting Started

### Prerequisites

- **Node.js** (v14+) and npm
- **Python** (v3.8+)

### Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   python main.py
   ```
   The server typically runs on `http://localhost:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The app opens automatically at `http://localhost:3000`

---

## Usage

1. **Open the application** at `http://localhost:3000`
2. **Input order data** by:
   - Copying and pasting email/document text
   - Uploading a file directly
3. **Select extraction type** based on your data format
4. **Process** the order and review the extracted data
5. **Download** the structured Excel file with organized order information

---

## API Endpoints

(Update these based on your actual backend endpoints)

- `POST /api/extract` – Extract order data from text
- `POST /api/extract-file` – Extract order data from uploaded file
- `GET /api/outputs/:filename` – Download processed Excel file

---

## Development

### Frontend Development
```bash
cd frontend
npm start          # Development mode
npm run build      # Production build
npm test           # Run tests
```

### Backend Development
```bash
cd backend
python main.py     # Run server
```

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

[Add your license here]

---

## Support

For issues or questions, please [create an issue in the repository] or contact the development team.

---

**Made with ❤️ for efficient order processing**
