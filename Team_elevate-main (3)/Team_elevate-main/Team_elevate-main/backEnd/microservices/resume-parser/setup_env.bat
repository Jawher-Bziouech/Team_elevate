@echo off
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo Downloading NLP models...
python -m spacy download en_core_web_sm
echo Setup complete!
pause
