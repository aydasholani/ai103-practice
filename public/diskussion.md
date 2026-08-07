Diskussions: 

Question 1:

 batmanx 2 weeks, 4 days ago
Standard
Deployment type Standard
Version update policy Opt out of automatic model version upgrades
   upvoted 1 times
 profitchannel 1 month, 3 weeks ago
"the data prcessed by the model must remain in the EU"
that is Standard for me:
By data residency requirement
No restrictions: Use Global Standard or Global Provisioned
EU data zone: Use DataZone Standard or DataZone Provisioned in an EU region
US data zone: Use DataZone Standard or DataZone Provisioned in a US region
Single region only: Use Standard or Regional Provisioned
   upvoted 4 times
 RICHARDALEX007 1 month, 4 weeks ago
The requirement asks for scalable, high-throughput, dynamically scaling capacity WITHOUT reserved throughput. That points to a pay-as-you-go consumption deployment rather than Provisioned (PTU). The highlighted 'Standard' is defensible, but 'Global Standard' is the offering Microsoft positions for the highest, most elastic throughput.

Deployment type: Global Standard
Version upgrade policy: Opt out of automatic model version upgrades
   upvoted 2 times

Question 2: 
 momo53 1 day, 1 hour ago
Selected Answer: C
Answer C. From what I understand, the requirements here mention protection against text in images, which is not addressed by Prompt Shields (which protects only from user prompts & document prompt). To protect from text in images, it must uses Azure Content Safety image moderation module.

Sources:
- "Securing Azure AI Applications: Against Prompt Injection | Part - 2" in Tech Community
- "Azure AI Content Safety documentation" in MS Learn (Quickstarts part)
   upvoted 1 times
 seesee1 3 days, 2 hours ago
Selected Answer: B
The requirement in question is: "The product sheets might contain images that include embedded text. Agent1 must be protected from malicious instructions potentially hidden within the images."

This describes an indirect prompt injection attack - malicious instructions embedded in content (in this case, text hidden inside images) that could hijack the agent's behavior when it processes that document. Microsoft Foundry's Prompt Shields (part of Azure AI Content Safety) is purpose-built to detect and block both direct and indirect prompt injection attempts, including those embedded in documents/images ingested by an agent, before they reach the model.
   upvoted 1 times
 batmanx 2 weeks, 4 days ago
Selected Answer: B
Feature PII Detection Prompt Shields
Detects personal data ✔ Yes ✔ Yes (indirectly)
Prevents data leakage ❌ No ✔ Yes
Blocks prompt injection ❌ No ✔ Yes
Protects against malicious image text ❌ No ✔ Yes
Meets Contoso’s compliance requirements ❌ No ✔ Yes
   upvoted 1 times
 RPC112 3 weeks, 1 day ago
Selected Answer: C
Personally Identifiable Information (PII) Detection

The requirement"must never reveal customer information" is a hard compliance requirement.
Prompt Shields solve the hidden-instructions problem, but they do not directly prevent disclosure of customer data. [learn.microsoft.com], [learn.microsoft.com]
The latest AI‑103 discussion sites and explanations for this exact case study also mark PII Detection as the correct answer
   upvoted 2 times
 CharlieMike 1 month ago
Selected Answer: C
I think it is C due to the security/compliance requirement
   upvoted 4 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
The requirement is that the agent must never reveal customer information even if a document with customer data is mistakenly added to the repository. PII detection is the control that identifies and redacts personal data in content. Prompt shields (B) defend against injection, not data leakage; self-harm (A) and violence (D) filtering address harmful content categories, not customer-data exposure.
   upvoted 2 times
 cayenne06 2 months ago
Selected Answer: B
I think it's B due to :"The product sheets might contain images that include embedded text. Agent1 must be protected from malicious instructions potentially hidden within the images."
   upvoted 2 times
 cloudera 1 month, 3 weeks ago
It's C. The technical requirement directly links to PII: Agent1 must never reveal customer information, even if it is added to storage1 by mistake.

Protection of PII is not optional; it is non-negotiable for every organisation — except perhaps a dodgy one.
   upvoted 1 times
 cayenne06 2 months ago
Selected Answer: B
I think it's C due to :"The product sheets might contain images that include embedded text. Agent1 must be protected from malicious instructions potentially hidden within the images."
   upvoted 2 times
 cloudera 1 month, 3 weeks ago
It's C. The technical requirement directly links to PII: Agent1 must never reveal customer information, even if it is added to storage1 by mistake.

Protection of PII is not optional; it is non-negotiable for every organisation — except perhaps a dodgy one.
Thanks me :)
   upvoted 1 times
 profitchannel 1 month, 3 weeks ago
customer information ist not nescessarily PII. that's why i think it is B.
   upvoted 2 times
 Vasent 2 months ago
Selected Answer: C
Since the case-study question mentions the requirement of NOT including any Customer information, so Agent1 must have the configuration setting of any "Personally identifiable Information" to be identified.
   upvoted 2 times

Question 3 
Selected Answer: C
A project connection centralizes the credential/endpoint once and is reused by every agent in the project, which is exactly 'centrally manage ... across all agents.' RBAC (A) and disabling key auth (B) are good security practices but do not centralize the credential reference, and a managed private endpoint (D) addresses network isolation, not credential management.

  Question 4: 
 RICHARDALEX007 1 month, 4 weeks ago
A project connection centralizes the credential/endpoint once and is reused by every agent in the project, which is exactly 'centrally manage ... across all agents.' RBAC (A) and disabling key auth (B) are good security practices but do not centralize the credential reference, and a managed private endpoint (D) addresses network isolation, not credential management.

Question 5:
 AIBoss 1 day, 12 hours ago
Content Understanding offers two modes for different scenarios:

Standard mode
- Ideal for processing single files with straightforward field extraction. Use standard mode when you need to extract structured data from individual documents, images, audio, or video files without cross-file analysis or complex reasoning requirements.

Pro mode
- Designed for advanced scenarios requiring multi-step reasoning and cross-file analysis.

Uses of pro mode:

Process multiple input files in a single request
Apply reasoning across different documents to validate, enrich, or aggregate data
Use reference data (knowledge base) to guide extraction and validation
Perform complex multi-step analysis that goes beyond simple field extraction

Question 6 
 RICHARDALEX007 1 month, 4 weeks ago
A managed identity is consumed through DefaultAzureCredential (not AzureKeyCredential, which is key-based, nor ClientSecretCredential, which needs a secret). The Responses API call to send a prompt is responses.create(); retrieve/compact are not the send operation.

Question #7

 Sridhar_AI_Engineer 4 weeks, 1 day ago
Why Upper ? required
A Send message expression that returns the stored user response

Why not Local.Var01 ?

Question #9
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
: The requirements - deterministic, step-based, conditional branching, shared state, optional triggered action, minimal dev effort - describe a Foundry workflow. Threads/runs (B) and app-code coordination (D) require custom orchestration (more effort), and a group-chat session (C) is non-deterministic conversational collaboration, not a deterministic branching process.

Question #10


 maxng52 1 week, 4 days ago
The error is an invalid project ID for a fine-tuned Custom Speech model, so the `project` property must be set to the GUID of the **Custom Speech project** that owns the model — not a URL (A/D, which aren't IDs) and not the generic Foundry project ID (C).
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
The error is an invalid project ID for a custom speech model, so the project property must be set to the custom speech project ID (a GUID identifying the Custom Speech project). A URL or endpoint URL is not a project ID, and 'the project ID' (C) is the generic Foundry project, not the Custom Speech project that owns the fine-tuned model.
   upvoted 1 times
 cloudera 1 month, 4 weeks ago
Selected Answer: B
I am pretty sure the answer should be B. the custom speech project ID.
   upvoted 2 times

Question #12
 cloudera Highly Voted  1 month, 3 weeks ago
Selected Answer: C
C is correct.

According to the Microsoft lifecycle policy for Custom Speech, when a custom model deployed to a custom endpoint expires, the endpoint does not suddenly shut down or throw errors. Instead, Azure Speech ensures service continuity by automatically falling back to the most recent available base model for that specific locale.

For more visit - https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-custom-speech-model-and-endpoint-lifecycle?utm_source=chatgpt.com&pivots=ai-foundry-portal
   upvoted 5 times
 Srini7 Most Recent  1 month ago
Selected Answer: C
Transcription route : Question is about Custom endpoint, So it fall back to the most recent base model for the same locale.
If the question is a batch transcription: then 'A" it will be fail with a 4xx error.
   upvoted 1 times
 7b5220c 1 month ago
Selected Answer: C
Answer C is the correct choice.

When a custom Speech-to-Text model in Azure reaches its expiration date, the endpoint does not experience an immediate outage. To prevent a hard disruption of service, Azure utilizes a fallback mechanism:

Speech recognition requests will automatically fall back to the most recent base model for the same locale.

In practice, this means:

The service continues to run: The agent will not receive 4xx errors (which makes Answer A incorrect).

Accuracy may decrease: Since the system now uses the general base model instead of the specially trained custom model, the specific adaptations to your vocabulary or acoustic environment are lost until a new custom model is trained and deployed.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
When a Custom Speech model passes its expiration, the deployed endpoint stops serving it and requests fail rather than silently using the expired model (B) or auto-deleting (D)
   upvoted 1 times

Question #13
Selected Answer: B
DefaultAzureCredential authenticates but a 403 means missing data-plane authorization. The least-privilege role that grants inference (data actions) is Cognitive Services OpenAI User. Cognitive Services User (A) covers non-OpenAI services, Contributor (C) is over-privileged control-plane, and Data Reader (D) does not grant inference.
   upvoted 2 times

  Question #14
  
 Mattt 2 weeks, 1 day ago
Selected Answer: D
D is more precise. required only forces the use of some tool, while {"type":"mcp"} explicitly forces the MCP tool. Also, option A uses incorrect Python syntax.
   upvoted 1 times
 RPC112 2 weeks, 2 days ago
Selected Answer: A
Its not D. Its A.
The question says:"force the agent to invoke the MCP tool on each run"
The documented behavior of tool_choice="required" is:
Force the model to call a tool instead of answering directly.
That directly addresses the problem statement:
Some runs return answers from the base model without invoking the knowledge base.

D. tool_choice={"type":"mcp"}
MCP is the tool protocol, not the standard tool_choice value used to force invocation.
Simply specifying "mcp" does not represent the documented way to require tool use.
   upvoted 1 times
 CharlieMike 4 weeks, 1 day ago
Selected Answer: A
tool_choice("required") forces the agent to invoke a tool every time. Since the MCP tool is the only applicable tool, the agent will use it on every run, ensuring grounded responses with citations instead of answering from the base model.
   upvoted 1 times
 Srini7 1 month ago
Selected Answer: D
Its D. Question Clearly state " add the correct tool _choice parameter to the code to deterministically force the agent to invoke the MCP tool on each run" in that case, we can't say "required" , becuase if you have more than one tool , its not valid. So answer is D
   upvoted 1 times
 Danielly 1 month ago
Selected Answer: D
Its D because tool_choice="required" only forces it to use a tool its not speficifed if the agent has other tools . Then you have to force that SPECIFIC tool
   upvoted 1 times
 cloudera 1 month, 3 weeks ago
Selected Answer: A
Syntax error but I will still go with A: tool_choice="required"

The issue is that the agent sometimes answers from the base model without calling the knowledge base tool. tool_choice="required" forces the agent to call a tool on each run, which prevents it from skipping retrieval and helps ensure grounded citations.

D is tempting because MCP is the tool type, but the question is about forcing tool use at runtime, not defining the MCP tool itself.

For more - https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-create-pipeline
   upvoted 3 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
To deterministically force a SPECIFIC tool, tool_choice must name the tool by type, so {"type":"mcp"} (D) is the intent. 'auto' (B) lets the model decide (the current bug), and {"required"} (A) is malformed set syntax; 'required' as a value forces some tool but not specifically the MCP one. The exact accepted schema for MCP tool_choice should be confirmed against the current Agents SDK
   upvoted 1 times

Question #15


 RICHARDALEX007 1 month, 4 weeks ago
Answers unsupported by retrieved documents are a groundedness problem, measured by groundedness evaluation metrics. Responses flagged for policy violations map to the risk and safety evaluators

Question #16

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: C
The OpenAPI tool injects a connection-stored key automatically when the spec declares an API key security scheme (apiKey in header). A per-operation header parameter (A) would require passing the value manually, a Key Vault connection (B) is not an OpenAPI construct, and a Bearer scheme (D) is for OAuth/JWT tokens, not a static header key.

Question #17
Selected Answer: B
A model cascade sends simple FAQs to a small/cheap model and escalates complex queries to a capable model, reducing cost/latency without degrading hard-question quality. Routing everything to a small model (A) hurts complex answers; routing all to the largest model (D) keeps costs high; raising max_tokens (C) does not reduce cost or latency.

Question #19
elected Answer: D
: Cost is driven by tokens, so token-usage observability reveals whether input size, output size, or expanded tool calls increased consumption. Latency (A), evaluation metrics (B), and run success rate (C) do not attribute cost to input/output/tool token volume.

Question #20


 RICHARDALEX007 1 month, 4 weeks ago
Forcing a retrieval step every run requires tool_choice=required (auto lets the model skip tools; none disables them). For an isolated, auditable identity that is the published agent's own, a distinct agent identity bound to the client app is correct; storing keys in prompts violates security and a shared project identity is not isolated.

Question #21

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
The 401 with a missing key header means the tool is not bound to the connection holding the key. Connecting the tool to Connection1 makes Foundry inject the stored key automatically. Identity passthrough (A) sends the caller's Entra token, not the API key; manually adding the header (B) hardcodes secrets; the default project connection (C) is not necessarily Connection1.
   upvoted 2 times
 cloudera 1 month, 4 weeks ago
Selected Answer: D
D. Connect the tool to Connection1.

B is incomplete answer and can expose secrets if done wrong.

Question #22

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Tracing shows the ordered span sequence of LLM calls, tool invocations, and timing within a single run, which is exactly what is needed to diagnose latency and incorrect-despite-correct-data behavior. Token usage (A), monitoring (B), and safety metrics (C) are aggregate signals, not per-run ordered traces.
   upvoted 1 times

Question #23

 profitchannel 1 month, 2 weeks ago
Selected Answer: A
but since one of the 4 questions should have a right answer, this is more likely the one with the right answer?
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
The threat is hidden instructions embedded in uploaded IMAGES (indirect/document attack) plus unsafe image content. A prompt shield for USER PROMPTS addresses direct jailbreak text from the user, not injected content extracted from images, so it does not meet the goal.
   upvoted 3 times
 cloudera 1 month, 4 weeks ago
Selected Answer: B
I don't think user prompts only does not fully meet the goal. It need Insafe Images and document/indirect prompt injection risk. Azure AI Content Safety Prompt Shields can detect both User Prompt Attacks and Document Attacks.

Question #24
 RPC112 2 weeks, 6 days ago
Selected Answer: B
Hidden instructions in images/documents → Prompt Shields for documents
Unsafe visual content (violence, nudity, illegal imagery, etc.) → Image content moderation / Analyze Image API

The scenario in questions 23–26 describes both risks together, which is why none of the four individual solutions on their own "meets the goal" as stated — each one only solves half the problem.

Would be A if Unsafe images were isolated and not combined with embedded hidden instructions.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
: Image moderation blocks unsafe visual content, which handles the 'unsafe images' half, but it does NOT neutralize hidden text instructions embedded in images (the prompt-injection half). Because the stated goal includes mitigating embedded instructions, image moderation alone does not fully meet the goal
   upvoted 3 times
 cloudera 1 month, 4 weeks ago
Selected Answer: B
Correct answer is B (No) again.
There is two issues here 1)unsafe image 2) hidden instructions.

Image moderation address unsafe image, but doesn't help with the #2 above. The 2nd part required prompt injection protection which is missing in the configuration.
   upvoted 3 times


Question #25
 Mattt 2 weeks, 1 day ago
Selected Answer: A
A is correct.
Here, “unsafe images” refers to images containing hidden malicious instructions. Prompt Shields for Documents can analyze the extracted text and detect these indirect prompt-injection attacks.
   upvoted 2 times
 7e4a230 3 weeks, 4 days ago
Selected Answer: A
Prompt Shields for Documents detect hidden or malicious instructions embedded in uploaded content. Because the model extracts the image’s text before processing it, the shield can analyze that extracted text for indirect prompt-injection attacks.
   upvoted 1 times
 cloudera 1 month, 3 weeks ago
Selected Answer: B
Two problem that need solving:
1) Upload Unsafe Image Content (eg. visually inappropriate, illegal, or violent imagery).
2) Indirect hidden prompt instructions.

Prompt Shield for documents can address the second part (hidden text). For the Upload unsafe image (#1 above) content, you will need Image moderation / Analyze image API.

So the answer is B.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Same as the 23 question. The threat is hidden instructions embedded in uploaded IMAGES (indirect/document attack) plus unsafe image content. A prompt shield for USER PROMPTS addresses direct jailbreak text from the user, not injected content extracted from images, so it does not meet the goal.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Apologies, this should be A.
Prompt Shields for Documents detects malicious instructions embedded in third-party content such as text extracted from images, which directly mitigates the hidden-instruction (indirect injection) risk.
   upvoted 2 times
 cloudera 1 month, 4 weeks ago
Selected Answer: B
B No.
Question #26
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Protected material detection identifies copyrighted/owned content in output. It has nothing to do with unsafe images or embedded malicious instructions, so it does not meet the goal.
   upvoted 2 times

   Question #27

   Selected Answer: D
Requirements says relevant, complete and Accurate
So should be D

Question #28

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
Constraining the agent to answer only about Contoso products is a scope/grounding instruction best enforced through the system message. Few-shot examples (B) shape style but do not reliably bound scope; top-p (C) and temperature (D) tune randomness, not topic restriction.
Question #29

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Deep multi-step reasoning over long contexts with detailed natural-language generation is the strength of an LLM. An SLM (B) trades reasoning depth for cost/latency; a multimodal model (A) adds image/audio not required here; key phrase extraction (C) is a narrow NLP task, not a generative reasoner.
   upvoted 1 times

Question #30

 RICHARDALEX007 1 month, 4 weeks ago
To guarantee a tool is invoked, set the tool_choice key to the value 'required'. The highlighted drag values place "tool_choice" as the key and "required" as the value, which forces tool usage on every run.

Question #31
Selected Answer: B
Centralized Configuration: Configuring the Azure AI Search connection at the project level (Project1) satisfies the requirement that multiple client applications use the same search configuration, minimizing redundancy.

Security & Compliance: Azure AI Foundry connections support Microsoft Entra ID (Azure RBAC) for authentication. This allows you to avoid API keys completely, ensuring compliance with the policy against key-based authentication.

Minimized Administrative Effort: Instead of managing endpoints, credentials, or custom code across every single client application individually (as suggested in options A, C, and D), you manage a single, shared connection within the Foundry project that the applications can simply reference.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
A single project connection gives all apps the same search configuration and uses Entra-based (keyless) auth with minimal admin effort. Custom per-app HTTP config (A) and calling Search directly from each app (C, D) duplicate configuration and increase administrative effort.

Question #32

 RICHARDALEX007 1 month, 4 weeks ago
Grounding with Bing Search supplies current public-web information; Code interpreter executes calculations during a conversation; File search retrieves from documents uploaded directly to the agent. Each highlighted pairing matches the canonical Foundry Agent Service tool.

Question #33

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: BC
For end-to-end tracing of agent runs from an external Python service, OpenTelemetry instruments the code and Application Insights stores/visualizes the traces - each is a complete tracing solution as worded. A Log Analytics workspace (A) backs App Insights but is not itself the tracing capability; Azure Monitor Agent (D) and Sentinel (E) are not used for agent run tracing

Question #34
ICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
Persisting and reusing the conversation/thread ID reloads the full server-side history (user/agent messages, tool calls, tool outputs) on each new turn and supports cross-session resumption. Storing only the final response (B) loses tool history; memory summarization (C) condenses rather than reloads the complete interaction history.
   upvoted 3 times


   Question #35
   
 RICHARDALEX007 1 month, 4 weeks ago
To maximize output stability/determinism, set temperature to 0 (lowest randomness). To maximize reasoning quality on a reasoning model, set the effort to high. The two highlighted selections satisfy 'improve output stability' and 'maximize reasoning quality' respectively.

Question #36
Selected Answer: B
Agentic RAG decomposes complex questions into subqueries spanning multiple chunks, uses conversation history to influence query planning, and runs subqueries in parallel to cut latency - matching all three requirements.
Classic RAG (D) is single-shot; iterative retrieval (A) is sequential; chain of thought (C) is a prompting technique, not a retrieval method.


Question #37
 RICHARDALEX007 1 month, 4 weeks ago
Retaining user preferences across conversations requires persistent agent memory (conversation history alone resets per session; orchestration session context is in-session). Letting users ground via documents uploaded during chat is the File search tool (Azure AI Search tool targets a pre-built index; code interpreter is for compute).

Question #38
Selected Answer: A
Implementing the fix 'in the logic of the application code before responses are returned' points to an evaluation/retry pass that checks completeness and regenerates if needed. Decreasing max_tokens (B) and using a smaller model (D) reduce completeness; switching to RAG (C) changes retrieval, not the in-code post-check requested.

Question #39
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: C
The standard, within-limits way to handle HTTP 429 is exponential backoff with jitter to spread retries. Immediate retry on a new thread (A) worsens throttling; reducing tools (B) and splitting files (D) do not address rate limits.

Question #40
 RICHARDALEX007 1 month, 4 weeks ago
GitHub Actions should authenticate to Azure with the Azure Login action using OIDC (federated credentials), avoiding stored secrets/PATs and managed identity isn't used for GitHub-hosted runners this way. To block merges when evaluation thresholds are not met, the workflow step must Fail (which fails the check and prevents merge); 'send an alert' or 'lock the branch' do not gate the PR check.

Question #41
 Mattt 2 weeks ago
Selected Answer: B
B. No.
Increasing max_tokens only allows a longer response; it does not ensure that required clauses are included. The issue is response completeness, not output truncation.
   upvoted 2 times
 Vasent 3 weeks, 2 days ago
Selected Answer: A
As Richard already explained, Increasing max_tokens does not force inclusion of the missing clauses (which is already present), so it does not meet the goal.
   upvoted 1 times
 cloudera 1 month, 4 weeks ago
Selected Answer: A
Increasing max_tokens can help improve response completeness because it gives the model more output budget to include all required regulatory clauses.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Clauses are present in the retrieved content but omitted from the summary, so the problem is selection/faithfulness, not output length truncation. Increasing max_tokens does not force inclusion of the missing clauses, so it does not meet the goal.
   upvoted 3 times

Question #42
 cloudera 1 month, 3 weeks ago
Selected Answer: A
A. Yes Reflection Pass is the correct.
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
A reflection pass that regenerates the response when required clauses are missing directly enforces completeness by re-checking and re-prompting until the clauses appear. This meets the goal.
   upvoted 1 times

Question #43

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Raising temperature increases randomness/creativity; it does not make the model reliably include required regulatory clauses and can make omissions worse. It does not meet the goal.

Question #44
 NVIT2026 1 week, 3 days ago
Selected Answer: B
Simply blocking incomplete responses prevents poor output from reaching the user, but it does not fix, improve, or regenerate the response to make it complete. It results in a failed request or error message rather than delivering a complete summary containing the required regulatory clauses.
   upvoted 1 times
 Mattt 2 weeks ago
Selected Answer: B
B. No. The evaluation flow only detects and blocks incomplete responses; it does not regenerate them or add the missing clauses.
   upvoted 2 times
 cloudera 1 month, 3 weeks ago
Selected Answer: B
While implementing an evaluation flow to score responses is an excellent practice for monitoring, but it does not actually improve the completeness of the generated summaries.
   upvoted 3 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
Running an evaluation flow that scores completeness and blocks sub-threshold responses enforces the completeness requirement before delivery, so it meets the goal.
   upvoted 2 times

Question #45

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Editing only inside a masked region while preserving the rest is exactly mask-based inpainting, which needs the input image plus a mask. image_variation (A) and text_to_image (B) regenerate broadly; high-strength image_to_image (C) regenerates the whole image, not just the masked area.
   upvoted 1 times

Question #46
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
To remove only the logo while keeping the rest intact, mask the logo region and inpaint. Increasing guidance (B), editing the prompt (C), or changing the seed (D) regenerate or re-roll the whole image and do not surgically remove one element.
   upvoted 1 times

Question #47
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
prebuilt-layout extracts content and layout elements (tables, structure) and detects barcodes/QR codes without needing a model deployment. prebuilt-read (B) does OCR text only (no layout/tables); documentFieldSchema (A) and documentSearch (C) are not the layout/QR extractor.

Question #48

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
Maintaining the product's identity and visual characteristics from a supplied photo is what high input_fidelity controls in image editing

Question #49
RICHARDALEX007 1 month, 4 weeks ago
To prevent prompt injection from document/image-embedded text, set the document-attack shield action to Block. Spotlighting is the Prompt Shields capability that marks third-party content as lower trust, directly satisfying 'treat third-party content as lower trust.' A custom blocklist or OCR pre-step do not provide the provenance/trust separation.
   upvoted 1 times

Question #50

 cloudera 1 month, 4 weeks ago
Selected Answer: D
I thought we were supposed to leave the discussion section empty when the answer is already correct. Aren't to discuss only when the question requires correction or further clarification.

It’s frustrating to see someone commenting on every single answer just to restate what’s already been said. It adds noise rather than value. Please avoid doing that — it’s unnecessary and distracting.
   upvoted 2 times
 profitchannel 1 month, 3 weeks ago
the comments are really helpful and provide background, you see from the answer match already when the answer ist correct!
   upvoted 4 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Image moderation classifies images into harm categories with severity levels and can block above a threshold. OCR keyword scanning (A) only handles embedded text; prompt shields (B) target injection; blocklists (C) match terms, not visual harm severity.
   upvoted 3 times

Question #51
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
OCR text appended to the prompt is third-party/document content, so Prompt Shields for Documents is the control that detects embedded malicious instructions. Image moderation (A) checks visual harm not instructions; protected material (C) is copyright; prompt shields for user prompts (D) target direct user jailbreaks.

Question #52

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Content Understanding converts mixed-format documents (scanned text, tables, multicolumn) into structured Markdown for downstream reasoning, and Microsoft recommends it as the starting point for file processing. A Language text model (A), a chat completion (B), or a multimodal Responses call (C) do not provide structure-preserving Markdown extraction as a first step.

Question #53
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Content Understanding provides OCR, layout analysis, and template-generalizing field extraction without training a custom model and with minimal admin effort. Language (A) is text analytics, and an Azure ML model (C) requires building/training.
   upvoted 2 times
 cloudera 1 month, 4 weeks ago
The answer is already correct. Why are you plastering your comments everywhere. Seriously, stop it — full stop.
   upvoted 1 times

Question #54


 e886835 4 weeks, 1 day ago
Selected Answer: A
Not B because this handles the scanning part, blindly cutting chunks at strict page boundaries will slice multipage tables in half incorrectly, destroying row context that spans across page breaks
   upvoted 1 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
Preserving tables/headings as structure-aware chunks with OCR and page-number metadata is what advanced/structure-aware data parsing provides; plain OCR with page-level chunking (B, C) stores whole pages and loses row-level table structure, and basic fixed-size chunking (D) ignores structure
   upvoted 2 times
 cloudera 1 month, 4 weeks ago
Well done, you finally got it right.
BTW, if I were you, I’d seriously mask my username. Just saying.
   upvoted 1 times
Question #55

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: A
To feed embedded images to the built-in OCR skill, the indexer must extract images into the normalized_images collection (the documented input for the OCR skill). A Shaper skill (B) restructures data, running OCR on the content field (C) is wrong because OCR needs image input, and outputFieldMappings (D) writes results, not image extraction.

Question #56

 cloudera 1 month, 4 weeks ago
Selected Answer: C
B attempting, but C is the correct answer. Why? The question is not only asking for invoice field extraction. The finance requirement is closer to “Understand invoice content and layout, then compare/validate it against contract terms.” This needs invoice processing plus contract/document reasoning or validation and for that Microsoft’s Content Understanding is the correct answer. For more visit https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/overview?view=doc-intel-4.0.0

To summarise:
Extract fields from invoices is B - Azure Document Intelligence. To review invoices against contract layout, text and reasoning is C - Azure Content Understanding which is the answer for this question.
   upvoted 2 times
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: C
The finance requirement is to evaluate both visual layout and textual content of varied-layout invoices with tables and logos and verify against contract terms - Content Understanding handles multimodal layout+text and reasoning. Document Intelligence (B) extracts fields but the multimodal layout-plus-reasoning framing favors Content Understanding; chat completions (A) and Image Analysis (D) do not do document field/layout extraction
   upvoted 2 times

Question #57

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: C
estimateFieldSourceAndConfidence makes the Content Understanding analyzer return a per-field confidence score plus source grounding (page/bounding box) so values can be verified and low-confidence ones routed to review. enableSegment (A), labeled samples (B), and generative extraction (D) do not produce per-field confidence+grounding.

Question #58
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: D
Transcripts within seconds of a continuous live stream require real-time speech to text. Batch transcription (C) is for recorded files (high latency); custom neural voice TTS (A) generates speech; speech translation (B) translates, neither giving low-latency live transcription.

Question #59

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
A low-latency voice agent with turn-taking needs real-time STT on input and TTS on output. Batch transcription (A) is high-latency; embeddings (C) do not transcribe/synthesize; speech translation (D) changes language rather than enabling spoken responses.

Question #60

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: B
Translator works best per source language; splitting mixed English/Spanish segments into single-language pieces and translating each gives complete, correct results. Document translation (A) and auto-detect (C) still mis-handle a single mixed segment; forcing English as source (D) mistranslates the Spanish parts.

Question #61

 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: AC
For an indexing pipeline enabling semantic/vector search over PDFs, Text Split chunks the documents and Azure OpenAI Embedding generates the vectors for vector search. Entity Recognition (B), Merge (D), Language Detection (E), and key phrase extraction (F) are not required to produce a vector index.

Question #62
 RICHARDALEX007 1 month, 4 weeks ago
Selected Answer: C
The technical requirement is an indexing pipeline with semantic and vector search so the agent can retrieve product info - that is Azure AI Search. Translator (A) and Bing grounding (B) do not index private PDFs; Document Intelligence (D) extracts content but is not the retrieval/index layer.


Question #64
 RICHARDALEX007 1 month, 3 weeks ago
Selected Answer: B
Extracting specific fields across varying templates AND returning confidence scores for sub-0.80 routing is a custom Content Understanding analyzer with estimateFieldSourceAndConfidence. prebuilt-layout (C) lacks the custom fields; documentSearch + search.score (D) is search relevance, not extraction confidence; a groundedness-guardrail agent (A) does not produce structured field confidence.
   upvoted 1 times



Question #67


Question #68


Question #69


Question #70


Question #71


Question #72



Question #73


Question #74


Question #75


Question #76


Question #77



Question #78


Question #79


Question #80


Question #81


Question #82




Question #83


Question #84


Question #85


Question #86


Question #87




Question #88


Question #89


Question #90


Question #91


Question #92




Question #93


Question #94


Question #95


Question #96


Question #97




Question #98


Question #99


Question #100


Question #101


Question #102




Question #103


Question #104


Question #105


Question #106


Question #107



Question #108


Question #109


Question #110


Question #111


Question #112




Question #113


Question #114


Question #115


Question #116


Question #117


