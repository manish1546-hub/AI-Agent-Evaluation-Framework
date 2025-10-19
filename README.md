# 🧠 AI Agent Evaluation Framework

A multi-tenant **Next.js** web app designed to evaluate AI agents on **accuracy, speed, and safety**.  
Each user can configure their own evaluation rules, ingest results, and visualize performance trends.

This app enables users to:

- Manage **evaluation settings** (run policy, sampling, PII masking, etc.)
- Store and view **evaluation results**
- Explore **dashboards** for performance metrics and trends
- Drill down into detailed **evaluation records**

🧩 Features

### 🔐 Authentication & Multi-Tenancy
- Implemented using **Supabase Auth**
- **Row-Level Security (RLS)** ensures each user only sees their own data

### ⚙️ Config UI
Users can manage the following settings:
| Setting | Type | Description |
|----------|------|-------------|
| `run_policy` | Enum (`always` / `sampled`) | Determines when evaluations are triggered |
| `sample_rate_pct` | Integer (0–100) | Sampling percentage for evaluation |
| `obfuscate_pii` | Boolean | Enable/disable PII masking in results |
| `max_eval_per_day` | Integer | Limit on evaluations per user per day |

### 📥 Evaluation Ingestion API

**Endpoint:** `POST /api/evals/ingest`

**Request Body Example:**
```json
{
  "interaction_id": "uuid",
  "prompt": "User input text",
  "response": "AI output text",
  "score": 0.94,
  "latency_ms": 320,
  "flags": ["safe", "accurate"],
  "pii_tokens_redacted": 2,
  "created_at": "2025-10-19T12:00:00Z"
}
