from dotenv import load_dotenv
from .server import app
import uvicorn

load_dotenv()

def main():
    uvicorn.run(app, host="localhost", port=8080)

main()