# main.py
from fastapi import FastAPI, Query
from .client.rq_client import queue
from .queues.worker import process_query

app = FastAPI()

# 1. CHECK THE PATH STRING: This is the critical part.
# If you put "/" here, the user must access 'http://localhost:8000/'
@app.get("/") 
def read_root():
    return {"message": "Welcome to FastAPI!"}

@app.post("/chat")
def chat(query: str = Query(..., description="The query to process")):
    job = queue.enqueue(process_query, query)
    return {"status" : "queued", "job_id":job.id}

@app.get('/job-status')
def get_result(job_id: str = Query(..., description="The ID of the job to check")):
    job = queue.fetch_job(job_id)
    result = job.return_value()
    return {"result": result}
