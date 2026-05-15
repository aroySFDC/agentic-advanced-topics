from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from openai import embeddings
from dotenv import load_dotenv

load_dotenv()

pdf_path = Path("C:\\Users\\ariji\\Downloads\\PDF-Guide-Node-Andrew-Mead-v3.pdf")
loader = PyPDFLoader(pdf_path)
pages = loader.load_and_split()
print(pages[30].page_content)

# split the docs into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks =  text_splitter.split_documents(pages)
expose 
# Create embeddings for the chunks
embedding_model = OpenAIEmbeddings(
    model = "text-embedding-3-large"
)

# Store the embeddings in Qdrant
vector_store = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embedding_model,
    url="http://localhost:6380",
    collection_name="pdf-guide-node-andrew-mead-v3"
)

print("Indexing complete!")
