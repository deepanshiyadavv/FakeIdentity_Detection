#!/bin/bash
echo "================================================="
echo " SSB NATIONAL DOCUMENT SCREENING PORTAL"
echo "================================================="
echo ""
echo "Starting Backend Engine (FastAPI)..."
cd backend
python -m venv venv
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo ""
echo "Starting Frontend UI (Vite)..."
cd ../
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both services are starting up!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both services."

# Trap Ctrl+C and kill background processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Wait indefinitely
wait
