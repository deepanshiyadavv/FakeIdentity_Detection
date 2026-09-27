@echo off
echo =================================================
echo  SSB NATIONAL DOCUMENT SCREENING PORTAL
echo =================================================
echo.

:: Start Backend
echo [1/2] Starting Backend Engine (FastAPI)...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing requirements (if missing)...
pip install -r requirements.txt >nul
start "SSB Backend Server" cmd /c "uvicorn main:app --reload --port 8000"

:: Start Frontend
echo.
echo [2/2] Starting Frontend UI (Vite)...
cd ..
echo Installing NPM packages (if missing)...
call npm install >nul
start "SSB Frontend App" cmd /c "npm run dev"

echo.
echo Both services have been started in separate windows!
echo Backend API Docs: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
echo.
pause
