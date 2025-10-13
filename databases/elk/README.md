# 🧠 ELK Stack (Elasticsearch + Kibana) - Local Setup with Docker

This project provides a minimal local setup for **Elasticsearch** and **Kibana** using **Docker Compose**.  
It’s ideal for learning and experimenting with Elasticsearch queries, Kibana dashboards, and sample datasets.

---

## 🚀 Services

| Service           | Description                                        | Port   | URL                                            |
| ----------------- | -------------------------------------------------- | ------ | ---------------------------------------------- |
| **Elasticsearch** | Data store and search engine                       | `9200` | [http://localhost:9200](http://localhost:9200) |
| **Kibana**        | Web interface for visualization & data exploration | `5601` | [http://localhost:5601](http://localhost:5601) |

---

## 🧩 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Minimum 2 GB of RAM available for Docker

---

## ⚙️ How to Run

1. **Clone this repository** (or copy the `docker-compose.yml` file into a new folder):

   ```bash
   git clone https://github.com/yourusername/elk-local-setup.git
   cd elk-local-setup
   ```

2. **Start the Stack**:

   ```bash
   docker compose up -d
   ```

3. Wait about 30–60 seconds for the containers to initialize.
4. Access Kibana in your browser: 👉 http://localhost:5601
5. (Optional) Test Elasticsearch directly:
   ```bash
   curl http://localhost:9200
   ```
   You should see a JSON response with cluster information.

## Load Sample Data in Kibana

Kibana includes several built-in sample datasets (eCommerce, web logs, flights):

1. Open http://localhost:5601
2. On the home page, click “Try our sample data”
3. Choose a dataset (e.g., “Sample eCommerce orders”)
4. Click “Add data”
5. Explore dashboards and visualizations!
