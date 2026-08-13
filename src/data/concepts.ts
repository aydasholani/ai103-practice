export type ConceptPair = {
  term: string;
  meaning: string;
  detail: string;
  domain: string;
  topic?: string;
  context?: string;
};

export const CONCEPT_PAIRS: ConceptPair[] = [
  { term: "File Search", meaning: "Retrieves relevant content from files made available to an agent", detail: "Use it when an agent should ground answers in uploaded or connected file content without you building the retrieval loop yourself.", domain: "Agents" },
  { term: "Code Interpreter", meaning: "Runs code in a sandbox to calculate, transform data, and analyze files", detail: "It is useful for calculations, charts, CSV analysis, and file transformations—not for calling your application's business APIs.", domain: "Agents" },
  { term: "Function calling", meaning: "Returns a structured request for application-defined code to execute", detail: "Your application implements and executes the function, then returns its result to the model.", domain: "Agents" },
  { term: "MCP", meaning: "A standard protocol for exposing tools, resources, and prompts to AI applications", detail: "MCP reduces custom integration work by giving clients and servers a shared way to describe and invoke capabilities.", domain: "Agents" },
  { term: "OpenAPI tool", meaning: "Lets an agent call an HTTP API described by an OpenAPI specification", detail: "Choose it when a REST API already has a suitable OpenAPI definition and should be exposed as an agent tool.", domain: "Agents" },
  { term: "tool_choice", meaning: "Controls whether and which tool the model should call", detail: "It can allow automatic selection, require tool use, or force a specific tool depending on the API and configuration.", domain: "Agents" },
  { term: "Agent instructions", meaning: "Persistent behavioral guidance applied to the agent", detail: "Instructions define role, boundaries, workflow, and response behavior; they are not retrieved business data.", domain: "Agents" },
  { term: "Agent memory", meaning: "Stores or retrieves durable user- or scope-specific information across interactions", detail: "Memory supports continuity beyond the immediate conversation context and should use an appropriate scope or partition key.", domain: "Agents" },
  { term: "Connected agent", meaning: "Allows one agent to delegate a task to another specialized agent", detail: "Use connected agents when distinct specialists need separate instructions or tools but must cooperate.", domain: "Agents" },
  { term: "Human approval", meaning: "Pauses an agent workflow until a person approves a sensitive action", detail: "This is a control for consequential or irreversible actions, not an evaluation metric.", domain: "Agents" },

  { term: "Azure AI Search", meaning: "Search service for keyword, vector, hybrid, and semantic retrieval over indexed content", detail: "It is commonly used as the retrieval layer in RAG solutions and can be connected to agents.", domain: "Search and RAG" },
  { term: "Data source", meaning: "Connection information for the external content an indexer reads", detail: "A data source identifies where indexable data lives, such as Blob Storage or supported databases.", domain: "Search and RAG" },
  { term: "Indexer", meaning: "Pulls data from a supported source and populates or refreshes a search index", detail: "An indexer automates ingestion. The index itself is the searchable structure produced or updated.", domain: "Search and RAG" },
  { term: "Skillset", meaning: "Enrichment pipeline applied by an Azure AI Search indexer", detail: "A skillset can OCR, split, translate, or enrich content before mapped output is written to an index or knowledge store.", domain: "Search and RAG" },
  { term: "Vector search", meaning: "Finds content whose embeddings are mathematically similar to the query embedding", detail: "It is useful for semantic similarity even when query and document use different words.", domain: "Search and RAG" },
  { term: "Semantic ranker", meaning: "Reranks an initial text result set using language understanding", detail: "It improves relevance of eligible text search results; it does not create the source index or generate embeddings.", domain: "Search and RAG" },
  { term: "Hybrid search", meaning: "Runs text and vector retrieval together and combines their results", detail: "Hybrid search benefits from exact keyword matches and semantic vector similarity in the same query.", domain: "Search and RAG" },
  { term: "RAG", meaning: "Retrieves grounding content and supplies it to a generative model", detail: "RAG adds external knowledge at inference time; it does not retrain the model's weights.", domain: "Search and RAG" },
  { term: "Chunking", meaning: "Splits large content into smaller retrievable passages", detail: "Chunk size and overlap affect retrieval precision, context continuity, token use, and answer quality.", domain: "Search and RAG" },
  { term: "Embedding", meaning: "Numeric vector representation used to compare semantic similarity", detail: "The same compatible embedding model and dimensions must be used for indexed vectors and vectorized queries.", domain: "Search and RAG" },

  { term: "System-assigned managed identity", meaning: "Identity tied to one Azure resource and removed with that resource", detail: "Azure manages its lifecycle. Grant it RBAC roles on services the resource must access.", domain: "Security" },
  { term: "User-assigned managed identity", meaning: "Independent Azure identity that can be attached to multiple resources", detail: "Its lifecycle is separate from the resources that use it, enabling reuse and centralized permission management.", domain: "Security" },
  { term: "RBAC", meaning: "Assigns Azure roles to identities at a defined scope", detail: "RBAC controls who or what can perform permitted operations on Azure resources and data.", domain: "Security" },
  { term: "Search Index Data Reader", meaning: "Allows reading and querying data in Azure AI Search indexes", detail: "It is a data-plane role for query access, not a role for managing the search service configuration.", domain: "Security" },
  { term: "Search Index Data Contributor", meaning: "Allows writing, updating, and deleting documents in search indexes", detail: "Use it for an ingestion identity that must modify indexed documents.", domain: "Security" },
  { term: "Cognitive Services User", meaning: "Allows an identity to use Azure AI service data-plane operations", detail: "It grants service use according to the resource scope, rather than ownership of the Azure resource.", domain: "Security" },
  { term: "Keyless connection", meaning: "Uses Microsoft Entra authentication instead of storing an API key", detail: "Managed identity plus appropriate RBAC roles is the common Azure pattern for a keyless connection.", domain: "Security" },
  { term: "Private endpoint", meaning: "Gives an Azure service a private IP address inside a virtual network", detail: "It keeps service access on private networking paths when public access is restricted.", domain: "Security" },
  { term: "Azure Key Vault", meaning: "Stores and controls access to secrets, keys, and certificates", detail: "Use it when secrets still exist; prefer managed identity where supported to reduce secret handling.", domain: "Security" },

  { term: "Tracing", meaning: "Records spans across model, tool, retrieval, and workflow operations", detail: "Tracing helps diagnose latency, failures, tool calls, and the path an agent took through a workflow.", domain: "Evaluation and safety" },
  { term: "Application Insights", meaning: "Collects application telemetry such as requests, dependencies, exceptions, and traces", detail: "It supports operational monitoring; it is not itself a content moderation model.", domain: "Evaluation and safety" },
  { term: "Groundedness evaluator", meaning: "Checks whether an answer is supported by the supplied context", detail: "A response can be relevant yet ungrounded if it introduces claims not supported by retrieved material.", domain: "Evaluation and safety" },
  { term: "Relevance evaluator", meaning: "Measures how well a response addresses the user request", detail: "Relevance focuses on answering the question, whereas groundedness focuses on support from context.", domain: "Evaluation and safety" },
  { term: "Content Safety", meaning: "Detects or filters harmful content across supported categories and modalities", detail: "It is used for safety controls, not factual grounding or retrieval relevance.", domain: "Evaluation and safety" },
  { term: "Prompt Shields", meaning: "Detects prompt-injection attacks in user prompts or documents", detail: "It helps identify instructions intended to override system behavior or manipulate the model through retrieved content.", domain: "Evaluation and safety" },
  { term: "Blocklist", meaning: "Detects specified words or phrases according to a custom list", detail: "A blocklist complements classifiers when an application needs organization-specific forbidden terms.", domain: "Evaluation and safety" },

  { term: "Content Understanding analyzer", meaning: "Defines how multimodal content is analyzed into structured output", detail: "Its schema can define fields that should be extracted or generated from documents, images, audio, or video.", domain: "Content extraction" },
  { term: "Document Intelligence", meaning: "Extracts text, tables, layout, and fields from documents", detail: "Use prebuilt or custom document models when document structure and field extraction are central.", domain: "Content extraction" },
  { term: "OCR", meaning: "Recognizes printed or handwritten text in images and scanned documents", detail: "OCR turns visible text into machine-readable text; it does not by itself understand the whole business meaning.", domain: "Content extraction" },
  { term: "Layout model", meaning: "Extracts document text together with structural elements such as tables and selection marks", detail: "Choose it when position and document structure matter beyond plain text recognition.", domain: "Content extraction" },
  { term: "Object detection", meaning: "Identifies object classes and returns their locations in an image", detail: "Unlike image classification, object detection can locate multiple instances with bounding regions.", domain: "Vision" },
  { term: "Image classification", meaning: "Assigns one or more labels to an entire image", detail: "Classification says what the image represents; it does not normally locate each object.", domain: "Vision" },
  { term: "Image captioning", meaning: "Generates a natural-language description of an image", detail: "Captions can support accessibility and content discovery, but must be reviewed when accuracy is critical.", domain: "Vision" },
  { term: "Speech to text", meaning: "Converts spoken audio into transcribed text", detail: "Use it for transcription, captions, or voice input. Text to speech performs the opposite conversion.", domain: "Language and speech" },
  { term: "Text to speech", meaning: "Synthesizes spoken audio from written text", detail: "It produces audio output and can use supported standard or custom voices.", domain: "Language and speech" },
  { term: "Speech translation", meaning: "Recognizes speech and translates it into another language", detail: "It combines speech recognition with translation rather than merely transcribing in the source language.", domain: "Language and speech" },
  { term: "Named entity recognition", meaning: "Identifies entities such as people, places, organizations, and dates in text", detail: "NER locates and categorizes entities; sentiment analysis instead evaluates expressed opinion or tone.", domain: "Language and speech" },
  { term: "PII detection", meaning: "Finds sensitive personal information in text", detail: "Use it to identify data such as contact details or identifiers before storage, display, or downstream processing.", domain: "Language and speech" },
  { term: "Sentiment analysis", meaning: "Estimates positive, neutral, negative, or mixed sentiment in text", detail: "It measures expressed sentiment and can return opinion-level detail; it does not identify all factual entities.", domain: "Language and speech" },
  { term: "Azure Translator", meaning: "Translates text between supported languages", detail: "Use it for text translation, transliteration, and related language operations rather than speech recognition.", domain: "Language and speech" },
];
