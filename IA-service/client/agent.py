import os
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, ".env"), override=True)
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

# Re-export processes from the agents package
from agents.chat_agent import process_chat
from agents.test_agent import process_fragrance_test

__all__ = ["process_chat", "process_fragrance_test"]
