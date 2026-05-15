from openai import OpenAI
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

# Create an open AI Client
openai_client = OpenAI()

#vector embedding
embedding_model = OpenAIEmbeddings(
    model = "text-embedding-3-large" 
)

#connect to qdrantvector store
vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embedding_model,  
    url="http://localhost:6380",
    collection_name="pdf-guide-node-andrew-mead-v3"
)


def process_query(query : str):
    # Simulate processing the query
    print(f"Searching chunk: {query}")
    results = vector_store.similarity_search(query)
    result_context = "\n".join([f"Page Content: {doc.page_content}\n Page Number: {doc.metadata.get('page_label')} " for doc in results])
    SYSTEM_PROMPT = """
    You are a helpful assistant that answers questions based on the following context retrieved from a PDF document. Use the retrieved context to provide accurate and concise answers to the user's questions. If the retrieved context does not contain relevant information, respond with "I don't know."
    Always base your answers solely on the provided context.:
    Context:
    {result_context}
    """
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT + result_context},
            {"role": "user", "content": query}
        ]
    )
    return response