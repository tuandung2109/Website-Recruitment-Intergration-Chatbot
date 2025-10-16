"""Utilities for syncing both company and job posting embeddings into a unified Qdrant collection."""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
import uuid

from qdrant_client.models import Distance, PointStruct, VectorParams, PointIdsList

from setting import Settings
from tool.database import PostgreSQLClient, QDrant

from .base import EmbeddingConfig
from .sentenceTransformer import SentenceTransformerEmbedding

logger = logging.getLogger(__name__)


def _build_company_text(record: Dict[str, Any]) -> str:
    """Build a single descriptive string used for embedding a company record."""
    parts: List[str] = []

    name = record.get("name")
    if name:
        parts.append(f"Tên công ty: {name}")

    website = record.get("website")
    if website:
        parts.append(f"Website: {website}")

    size = record.get("size")
    if size:
        parts.append(f"Quy mô: {size}")

    description = record.get("description")
    if description:
        parts.append(f"Mô tả: {description}")

    addresses = record.get("addresses")
    if addresses:
        parts.append(f"Địa chỉ: {addresses}")

    industries = record.get("industries")
    if industries:
        parts.append(f"Ngành nghề: {industries}")

    return ". ".join(parts).strip()



def _build_skill_text(record: Dict[str, Any]) -> str:
    """Build a single descriptive string used for embedding a skill from job posting record."""
    skills = record.get("skills")
    if skills:
        if isinstance(skills, list):
            return ", ".join(skills)
        return str(skills)
    return ""


def _build_job_posting_text(record: Dict[str, Any]) -> str:
    """Build a single descriptive string used for embedding a job posting record."""
    parts: List[str] = []

    position_name = record.get("position_name")
    if position_name:
        parts.append(f"Vị trí tuyển dụng: {position_name}")
        
    job_description = record.get("job_description")
    if job_description:
        parts.append(f"Mô tả công việc: {job_description}")
        
    requirements = record.get("requirements")
    if requirements:
        parts.append(f"Yêu cầu: {requirements}")
        
    salary = record.get("salary")
    if salary:
        parts.append(f"Mức lương: {salary}")

    deadline = record.get("deadline")
    if deadline:
        parts.append(f"Hạn nộp: {deadline}")

    experience_year = record.get("experience_year")
    if experience_year:
        parts.append(f"Kinh nghiệm: {experience_year}")
    
    education_level = record.get("education_level")
    if education_level:
        parts.append(f"Trình độ học vấn: {education_level}")
    
    benefits = record.get("benefits")
    if benefits:
        parts.append(f"Phúc lợi: {benefits}")
    
    working_time = record.get("working_time")
    if working_time:
        parts.append(f"Thời gian làm việc: {working_time}")
    
    name_of_company = record.get("name_of_company")
    if name_of_company:
        parts.append(f"Công ty: {name_of_company}")
        
    industries = record.get("industries")
    if industries:
        parts.append(f"Ngành nghề: {industries}")
    
    skills = record.get("skills")
    if skills:
        parts.append(f"Kỹ năng: {skills}")
        
    addresses = record.get("addresses")
    if addresses:
        parts.append(f"Địa chỉ: {addresses}")
    
    return ". ".join(parts).strip()


def _ensure_collection(client, collection_name: str, vector_size: int) -> None:
    """Ensure the Qdrant collection exists and matches the expected vector size."""
    try:
        collection = client.get_collection(collection_name=collection_name)
        existing_size: Optional[int] = None

        try:
            vectors = collection.config.params.vectors  # type: ignore[attr-defined]
            if isinstance(vectors, VectorParams):
                existing_size = vectors.size
            elif isinstance(vectors, dict):
                existing_size = vectors.get("size")
        except AttributeError:
            existing_size = None

        if existing_size and existing_size != vector_size:
            logger.info(
                "Qdrant collection '%s' has size %s, recreating with size %s",
                collection_name,
                existing_size,
                vector_size,
            )
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE,
                ),
            )
            logger.info(
                "Recreated Qdrant collection '%s' with vector size %s",
                collection_name,
                vector_size,
            )
        return
    except Exception:
        logger.info("Qdrant collection '%s' missing. Creating...", collection_name)

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=vector_size,
            distance=Distance.COSINE,
        ),
    )
    logger.info("Created Qdrant collection '%s' with vector size %s", collection_name, vector_size)


def _resolve_embedding_model(model_name: str) -> SentenceTransformerEmbedding:
    """Get a sentence transformer embedding model, preferably via the model manager cache."""
    embedding_model: Optional[SentenceTransformerEmbedding] = None

    try:
        from tool.model_manager import model_manager  # Local import to avoid circular dependency

        embedding_model = model_manager.get_embedding_model(model_name)
    except Exception as error:  # pragma: no cover - fallback path
        logger.debug("Falling back to direct sentence transformer load: %s", error)

    if embedding_model is None:
        config = EmbeddingConfig(name=model_name)
        embedding_model = SentenceTransformerEmbedding(config)

    return embedding_model


def sync_entities_embeddings(
    settings: Optional[Settings] = None,
    *,
    collection_name: str = "entities",
    batch_size: int = 64,
    limit: Optional[int] = None,
) -> Dict[str, Any]:
    """Fetch company and job posting data from PostgreSQL and upsert embeddings into unified Qdrant collection.
    
    This function creates three types of embeddings:
    - Company embeddings: Based on company information
    - Job posting embeddings: Based on full job posting information
    - Skill embeddings: Based on skills extracted from job postings (with entity_type='skill')

    Args:
        settings: Application settings instance. If omitted, settings will be loaded lazily.
        collection_name: Name of the unified Qdrant collection (default: 'entities').
        batch_size: Number of vectors to upsert per request.
        limit: Maximum number of records to fetch from each procedure.

    Returns:
        A dictionary summarising the sync results for all three entity types (companies, job postings, and skills).
    """

    settings = settings or Settings.load_settings()
    
    pg_client = PostgreSQLClient(Settings=settings)
    
    # Fetch data from both procedures
    logger.info("Fetching company data from PostgreSQL...")
    companies = pg_client.get_data_from_procedures("get_company_infor", limit=limit or 1000)
    
    logger.info("Fetching job posting data from PostgreSQL...")
    job_postings = pg_client.get_data_from_procedures("get_job_posting_infor", limit=limit or 1000)
    
    # Skills will be extracted from job_postings, so we count them separately
    total_records = len(companies) + len(job_postings)
    
    logger.info(f"Retrieved {len(companies)} companies and {len(job_postings)} job postings (skills will be extracted from job postings)")
    
    if total_records == 0:
        logger.info("No records returned from PostgreSQL procedures")
        return {
            "status": "empty",
            "collection": collection_name,
            "companies": 0,
            "job_postings": 0,
            "skills": 0,
            "total_records": 0,
            "upserted": 0,
        }

    # Initialize embedding model
    embedding_model = _resolve_embedding_model(settings.EMBEDDING_MODE)

    try:
        embedding_dim = embedding_model.embedding_model.get_sentence_embedding_dimension()
    except AttributeError:  # pragma: no cover - fallback for custom models
        sample_vector = embedding_model.encode("sample text")
        if hasattr(sample_vector, "tolist"):
            sample_vector = sample_vector.tolist()
        embedding_dim = len(sample_vector)

    configured_size = getattr(settings, "QDRANT_VECTOR_SIZE", embedding_dim)
    if configured_size != embedding_dim:
        logger.info(
            "Embedding dimension %s differs from configured %s; using embedding dimension",
            embedding_dim,
            configured_size,
        )

    vector_size = embedding_dim

    # Initialize Qdrant client
    qdrant = QDrant(Settings=settings)
    qdrant_client = qdrant.get_client()
    _ensure_collection(qdrant_client, collection_name, vector_size)

    # Get existing IDs from Qdrant for smart update
    existing_company_ids = set()
    existing_job_posting_ids = set()
    existing_skill_ids = set()
    
    try:
        # Scroll through all points to get existing IDs
        scroll_result = qdrant_client.scroll(
            collection_name=collection_name,
            limit=10000,  # Adjust based on your data size
            with_payload=True,
            with_vectors=False
        )
        
        for point in scroll_result[0]:
            point_id = str(point.id)
            # Check entity_type in payload to determine the entity type
            entity_type = point.payload.get("entity_type") if point.payload else None
            if entity_type == "company":
                existing_company_ids.add(point_id)
            elif entity_type == "job_posting":
                existing_job_posting_ids.add(point_id)
            elif entity_type == "skill":
                existing_skill_ids.add(point_id)
        
        logger.info(f"Found {len(existing_company_ids)} existing companies, {len(existing_job_posting_ids)} existing job postings, and {len(existing_skill_ids)} existing skills in Qdrant")
    except Exception as e:
        logger.warning(f"Could not fetch existing IDs from Qdrant: {e}")

    points: List[PointStruct] = []
    skipped: List[str] = []
    new_company_ids = set()
    new_job_posting_ids = set()
    new_skill_ids = set()
    skills_processed = 0

    # Process company records
    logger.info(f"Processing {len(companies)} company records...")
    for record in companies:
        company_id = record.get("company_id")
        if company_id is None:
            skipped.append(f"company_None")
            continue

        text = _build_company_text(record)
        if not text:
            skipped.append(f"company_{company_id}")
            continue

        try:
            vector = embedding_model.encode(text)
            if hasattr(vector, "tolist"):
                vector = vector.tolist()

            if not isinstance(vector, list):
                vector = list(vector)

            payload = {
                "entity_type": "company",
                "company_id": company_id,
                "name": record.get("name"),
                "website": record.get("website"),
                "size": record.get("size"),
                "description": record.get("description"),
                "addresses": record.get("addresses"),
                "industries": record.get("industries"),
            }

            # Create unique point ID - Qdrant accepts only UUID or int
            # Generate deterministic UUID from company_id with namespace
            namespace = uuid.UUID('00000000-0000-0000-0000-000000000001')  # Company namespace
            point_id = str(uuid.uuid5(namespace, f"company_{company_id}"))
            
            # Track new IDs
            new_company_ids.add(point_id)

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload,
                )
            )
        except Exception as e:
            logger.warning(f"Failed to process company {company_id}: {e}")
            skipped.append(f"company_{company_id}")
            continue

    # Process job posting records
    logger.info(f"Processing {len(job_postings)} job posting records...")
    for record in job_postings:
        job_posting_id = record.get("job_posting_id")
        if job_posting_id is None:
            skipped.append(f"job_posting_None")
            continue

        text = _build_job_posting_text(record)
        if not text:
            skipped.append(f"job_posting_{job_posting_id}")
            continue

        try:
            vector = embedding_model.encode(text)
            if hasattr(vector, "tolist"):
                vector = vector.tolist()

            if not isinstance(vector, list):
                vector = list(vector)

            payload = {
                "entity_type": "job_posting",
                "job_posting_id": job_posting_id,
                "position_name": record.get("position_name"),
                "job_description": record.get("job_description"),
                "requirements": record.get("requirements"),
                "salary": record.get("salary"),
                "deadline": record.get("deadline"),
                "experience_year": record.get("experience_year"),
                "education_level": record.get("education_level"),
                "benefits": record.get("benefits"),
                "working_time": record.get("working_time"),
                "name_of_company": record.get("name_of_company"),
                "industries": record.get("industries"),
                "skills": record.get("skills"),
                "addresses": record.get("addresses"),
            }

            # Create unique point ID - Qdrant accepts only UUID or int
            # Generate deterministic UUID from job_posting_id with namespace
            namespace = uuid.UUID('00000000-0000-0000-0000-000000000002')  # Job posting namespace
            point_id = str(uuid.uuid5(namespace, f"job_posting_{job_posting_id}"))
            
            # Track new IDs
            new_job_posting_ids.add(point_id)

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload,
                )
            )
        except Exception as e:
            logger.warning(f"Failed to process job posting {job_posting_id}: {e}")
            skipped.append(f"job_posting_{job_posting_id}")
            continue

    # Process skill records from job postings
    logger.info(f"Processing skill records from {len(job_postings)} job postings...")
    for record in job_postings:
        job_posting_id = record.get("job_posting_id")
        if job_posting_id is None:
            continue

        text = _build_skill_text(record)
        if not text:
            continue

        try:
            vector = embedding_model.encode(text)
            if hasattr(vector, "tolist"):
                vector = vector.tolist()

            if not isinstance(vector, list):
                vector = list(vector)

            # Keep all job posting fields in payload but change entity_type to skill
            payload = {
                "entity_type": "skill",
                "job_posting_id": job_posting_id,
                "position_name": record.get("position_name"),
                "job_description": record.get("job_description"),
                "requirements": record.get("requirements"),
                "salary": record.get("salary"),
                "deadline": record.get("deadline"),
                "experience_year": record.get("experience_year"),
                "education_level": record.get("education_level"),
                "benefits": record.get("benefits"),
                "working_time": record.get("working_time"),
                "name_of_company": record.get("name_of_company"),
                "industries": record.get("industries"),
                "skills": record.get("skills"),
                "addresses": record.get("addresses"),
            }

            # Create unique point ID - Qdrant accepts only UUID or int
            # Generate deterministic UUID from job_posting_id with skill namespace
            namespace = uuid.UUID('00000000-0000-0000-0000-000000000003')  # Skill namespace
            point_id = str(uuid.uuid5(namespace, f"skill_{job_posting_id}"))
            
            # Track new IDs
            new_skill_ids.add(point_id)
            skills_processed += 1

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload,
                )
            )
        except Exception as e:
            logger.warning(f"Failed to process skill from job posting {job_posting_id}: {e}")
            skipped.append(f"skill_{job_posting_id}")
            continue

    logger.info(f"Successfully processed {skills_processed} skill embeddings from job postings")

    if not points:
        logger.warning("No valid records to upsert into Qdrant")
        return {
            "status": "skipped",
            "collection": collection_name,
            "companies": len(companies),
            "job_postings": len(job_postings),
            "skills": skills_processed,
            "total_records": total_records,
            "upserted": 0,
            "skipped_ids": skipped,
            "skipped_count": len(skipped),
            "vector_dim": vector_size,
        }

    # Delete obsolete records (exist in Qdrant but not in PostgreSQL)
    company_ids_to_delete = existing_company_ids - new_company_ids
    job_posting_ids_to_delete = existing_job_posting_ids - new_job_posting_ids
    skill_ids_to_delete = existing_skill_ids - new_skill_ids
    total_deleted = 0
    
    if company_ids_to_delete or job_posting_ids_to_delete or skill_ids_to_delete:
        ids_to_delete = list(company_ids_to_delete) + list(job_posting_ids_to_delete) + list(skill_ids_to_delete)
        
        if ids_to_delete:
            try:
                qdrant_client.delete(
                    collection_name=collection_name,
                    points_selector=PointIdsList(points=ids_to_delete)
                )
                total_deleted = len(ids_to_delete)
                logger.info(
                    f"Deleted {len(company_ids_to_delete)} obsolete companies, "
                    f"{len(job_posting_ids_to_delete)} obsolete job postings, and "
                    f"{len(skill_ids_to_delete)} obsolete skills from Qdrant"
                )
            except Exception as e:
                logger.warning(f"Failed to delete obsolete records: {e}")

    # Upsert points in batches (this will update existing or insert new)
    total_upserted = 0
    total_updated = 0
    total_inserted = 0
    
    # Combine all existing IDs for easier lookup
    all_existing_ids = existing_company_ids | existing_job_posting_ids | existing_skill_ids
    
    for start in range(0, len(points), batch_size):
        batch = points[start : start + batch_size]
        qdrant_client.upsert(collection_name=collection_name, points=batch)
        total_upserted += len(batch)
        
        # Count how many are updates vs inserts
        for point in batch:
            # Ensure both point.id and existing IDs are strings for comparison
            point_id_str = str(point.id)
            if point_id_str in all_existing_ids:
                total_updated += 1
            else:
                total_inserted += 1
        
        logger.info(f"Upserted batch {start // batch_size + 1}: {len(batch)} vectors")

    logger.info(
        "Successfully synced embeddings into collection '%s': "
        "%s inserted, %s updated, %s deleted",
        collection_name,
        total_inserted,
        total_updated,
        total_deleted,
    )

    result: Dict[str, Any] = {
        "status": "success",
        "collection": collection_name,
        "companies": len(companies),
        "job_postings": len(job_postings),
        "skills": skills_processed,
        "total_records": total_records,
        "upserted": total_upserted,
        "inserted": total_inserted,
        "updated": total_updated,
        "deleted": total_deleted,
        "vector_dim": vector_size,
    }

    if skipped:
        result["skipped_ids"] = skipped
        result["skipped_count"] = len(skipped)

    return result


__all__ = ["sync_entities_embeddings"]
