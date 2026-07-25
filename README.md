# ⚡️ Contractizer (Contract Risk Analyzer)

> **Identify Critical Contract Risks Before They Compromise the Mission.**

Contractizer is an advanced, AI-powered legal document analysis platform. Featuring a custom glassmorphic HUD interface, it allows users to upload complex agreements and instantly surface anomalies, predatory clauses, and liability exposures through a tactical, real-time dashboard.

## 🚀 Features

- **Tactical HUD UI**: Custom-built, high-performance interface with Framer Motion micro-animations, glassmorphism, and a dark tactical aesthetic.
- **Google OAuth**: Secure, seamless single sign-on using `@react-oauth/google` and Google Identity Services.
- **HuggingFace AI Analysis**: Leverage advanced NLP models via the HuggingFace Inference API to scan and detect hidden risks in legal clauses.
- **Serverless PostgreSQL**: Lightning-fast data storage powered by Supabase (PostgreSQL + asyncpg).
- **Vercel Full-Stack Deployment**: Completely serverless architecture with Vite (React) on the frontend and FastAPI (Python) on the backend, routed automatically via `vercel.json`.
- **Cloudinary Integration**: Fast, secure, and ephemeral PDF upload handling.

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios

**Backend:**
- Python 3.10+
- FastAPI (Serverless on Vercel)
- SQLAlchemy (asyncpg + pg8000)
- HuggingFace Hub
- PyMuPDF (Text Extraction)
- Cloudinary

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/harshrtr07-dhruv/Contractizer.git
cd Contractizer/contract-risk-analyzer
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```env
DATABASE_URL=postgresql://postgres.yourproject:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
SECRET_KEY=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
HUGGINGFACE_API_KEY=hf_your_api_key
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the frontend:
```bash
npm run dev
```

## 🌍 Vercel Deployment

This project is pre-configured for Vercel using `vercel.json`. 

1. Import the repository in Vercel.
2. Leave the Framework Preset as **Other** or **Vite**.
3. **Important**: Copy all variables from your `backend/.env` and `frontend/.env` into Vercel's Environment Variables settings.
4. **Do NOT** include `VITE_API_BASE_URL` in Vercel. The app will automatically use Vercel's internal relative routing in production.
5. Deploy!

## 🔐 Google OAuth Configuration
Ensure that both your local (`http://localhost:5173`) and production (`https://your-app.vercel.app`) URLs are whitelisted in your Google Cloud Console under:
- **Authorized JavaScript origins**
- **Authorized redirect URIs**

---
*Developed as a tactical legal intelligence platform.*
