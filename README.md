# 💰 Smart Expense Tracker — Agentic AI

> An intelligent expense tracking application powered by **Spring Boot** + **Agentic AI**, enabling natural language expense logging, spending analysis, budget alerts, and personalized financial advice.

---

## 📸 Screenshots

### Dashboard / Home
<!-- ADD SCREENSHOT: Main dashboard showing expense overview -->
![Dashboard](screenshots/dashboard.png)

### AI Chat Interface
<!-- ADD SCREENSHOT: Chat window showing AI conversation -->
![AI Chat](screenshots/ai-chat.png)

### Receipt Image Upload
<!-- ADD SCREENSHOT: Uploading a receipt image and AI auto-logging the expense -->
![Receipt Upload](screenshots/receipt-upload.png)

### Budget Alert
<!-- ADD SCREENSHOT: Budget status with 🔴🟡🟢 indicators -->
![Budget Alert](screenshots/budget-alert.png)

### Spending Analysis
<!-- ADD SCREENSHOT: Category-wise spending breakdown -->
![Spending Analysis](screenshots/spending-analysis.png)

---

## 🚀 Features

| Feature | Description | Status |
|--------|-------------|--------|
| 💬 **Save Expense via Chat** | Log expenses using natural language (e.g. "Add ₹300 for food") | ✅ |
| 🖼️ **Receipt Image Analysis** | Upload a bill photo — AI auto-extracts and logs the expense | ✅ |
| 📊 **Spending Analysis** | Category-wise breakdown of total spending | ✅ |
| 🔔 **Budget Alert** | 🔴🟡🟢 real-time budget status per category | ✅ |
| 🧠 **Financial Advice** | AI-generated personalized tips based on actual spending data | ✅ |
| 🕐 **Multi-turn Memory** | Context-aware conversations across the same session | ✅ |
| 🔄 **Recurring Expense Prediction** | Scheduler-based detection of recurring expenses | ✅ |

---

## 🤖 Agentic AI Tools

The AI agent has access to the following tools that it calls based on your query:

```
saveExpenseTool         → Logs an expense to the database
getSpendingAnalysis     → Fetches category-wise spending summary
checkBudgetStatus       → Returns budget usage with status indicators
getFinancialAdvice      → Analyzes 30-day data and gives personalized tips
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3 |
| AI Integration | Spring AI, OpenRouter API |
| AI Model | `gemini-2.0-flash-lite-001` via OpenRouter |
| Database | MySQL |
| Security | Spring Security (JWT) |
| Frontend | HTML, CSS, JavaScript |

---

## ⚙️ Setup & Installation

### Prerequisites
- Java 17+
- MySQL
- Maven
- OpenRouter API Key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Configure `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

spring.ai.openrouter.api-key=YOUR_OPENROUTER_API_KEY
spring.ai.openrouter.chat.options.model=google/gemini-2.0-flash-lite-001
```

### 3. Run the application
```bash
mvn spring-boot:run
```

### 4. Access the app
```
http://localhost:8080
```

---

## 💬 Example Prompts

```
"Add ₹500 for groceries today"
"Show me my spending summary"
"What is my budget status?"
"Give me financial advice based on my spending"
"Add ₹200 more in the same category"   ← uses multi-turn memory
```

---

## 📁 Project Structure

```
src/
├── controller/
│   ├── AIChatController.java       # Chat + image endpoint
│   └── ...
├── service/
│   ├── ChatHistoryService.java     # Chat history logic
│   └── ...
├── config/
│   └── AIToolsConfig.java          # All AI tool definitions
├── model/
│   ├── ChatHistory.java
│   └── ...
├── repository/
└── ...
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message (supports image upload) |
| `GET` | `/api/chat/session` | Generate a new session ID |
| `GET` | `/api/chat/history/{sessionId}` | Get chat history for a session |
| `GET` | `/api/predictions` | Get recurring expense predictions |

---

## 📌 How to Add Your Screenshots

1. Create a `screenshots/` folder in the project root
2. Take screenshots of your running app
3. Save them with these exact filenames:
   - `dashboard.png`
   - `ai-chat.png`
   - `receipt-upload.png`
   - `budget-alert.png`
   - `spending-analysis.png`
4. The images will auto-appear in this README on GitHub

---

## 👩‍💻 Author

**Khushi**  
B.Tech Student | Spring Boot + AI Enthusiast  
<!-- ADD: Your GitHub profile link -->

---

## 📄 License

This project is for educational purposes.
