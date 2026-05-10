from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

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

# Take user input and query the vector store
query = input("Enter your query: ")
results = vector_store.similarity_search(query)
print(f"Found {len(results)} relevant chunks.")
context = "\n\n\n".join([f"Page Content : {result.page_content}\n Page Number: {result.metadata["page_label"]}" for result in results])

SYSTEM_PROMPT = """
You are a helpful assistant that answers questions based on the following context retrieved from a PDF document. Use the retrieved context to provide accurate and concise answers to the user's questions. If the retrieved context does not contain relevant information, respond with "I don't know."
Always base your answers solely on the provided context.:
Context : {context}
"""

openai_client = OpenAI()
response = openai_client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT.format(context=context)},
        {"role": "user", "content": query}
    ]
)
print("Answer:", response.choices[0].message.content)
