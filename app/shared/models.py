from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import os

is_portable = os.getenv("IS_PORTABLE") == 'true'

if is_portable:
    DATABASE_URL = f'postgresql+asyncpg://postgres@127.0.0.1:5432/databot'
else:
    DATABASE_URL = f'postgresql+asyncpg://{os.getenv("DATABOT_DB_USER")}:{os.getenv("DATABOT_DB_PASS")}@{os.getenv("DATABOT_DB_HOST")}:{os.getenv("DATABOT_DB_PORT")}/{os.getenv("DATABOT_DB_DATABASE")}'

engine = create_async_engine(DATABASE_URL) 
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db_session():
    async with SessionLocal() as session:
        yield session


Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    has_access = Column(Boolean, default=False)
    active_db_id = Column(Integer)
    personal_dashboard_id = Column(Integer)
    group_memberships = Column(MutableList.as_mutable(ARRAY(String)), default=['Default'])
    custom_attribute_assignments = Column(MutableDict.as_mutable(JSON))
    lang_pref = Column(String)
    card_height_pref = Column(String)
    show_interim_result_pref = Column(Boolean)
    instructions=Column(String)
    created_at = Column(DateTime(timezone=False), default=func.now())
    last_login = Column(DateTime(timezone=False))
    password_hash = Column(String, nullable=False)
    reset_password_token = Column(String, unique=True)
    reset_password_token_expiration = Column(DateTime)

class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String)
    value = Column(String)

class BI_DB_Connection_References(Base):
    __tablename__ = 'bi_db_connection_references'
    id = Column(Integer, primary_key=True, index=True)
    db_engine = Column(String, nullable=False)
    db_id = Column(Integer, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    db_description = Column(String)

class BI_Table_Permissions_And_Metadata(Base):
    __tablename__ = 'bi_table_permissions_and_metadata'
    id = Column(Integer, primary_key=True, index=True)
    db_id = Column(Integer, nullable=False)
    table_id = Column(Integer, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    groups_with_access = Column(MutableList.as_mutable(ARRAY(String)), default=[])
    rlac = Column(MutableDict.as_mutable(JSON))
    table_description = Column(String)
    metadata_cache = Column(String)
    metadata_cache_is_up_to_date = Column(Boolean, default=False)  

class BI_Fields_Metadata(Base):
    __tablename__ = 'bi_fields_metadata'
    id = Column(Integer, primary_key=True, index=True)
    db_id = Column(Integer, nullable=False)
    table_id = Column(Integer, nullable=False)
    field_id = Column(Integer, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    data_obfuscation_groups = Column(MutableList.as_mutable(ARRAY(String)), default=[])
    field_description = Column(String)

class DB_Connection(Base):
    __tablename__ = 'db_connections'
    id = Column(Integer, primary_key=True, index=True)
    db_display_name = Column(String, nullable=False)  # display name would be used in db dropdown in main page
    db_engine = Column(String, nullable=False)
    connection_details = Column(MutableDict.as_mutable(JSON), nullable=False)
    db_description = Column(String)
    # Relationships
    # info_schema = relationship("DB_Info_Schema", backref="db_connection", cascade="all, delete-orphan")
    tables = relationship("DB_Table", backref="db_connection", cascade="all, delete-orphan")
    fields = relationship("DB_Field", backref="db_connection", cascade="all, delete-orphan")
    
class DB_Table(Base):
    __tablename__ = 'db_tables'
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, nullable=False)
    table_schema = Column(String, nullable=False)
    table_type = Column(String, nullable=False)  # e.g., 'BASE TABLE', 'VIEW' in postgres
    db_id = Column(Integer, ForeignKey('db_connections.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    groups_with_access = Column(MutableList.as_mutable(ARRAY(String)), default=[])
    rlac = Column(MutableDict.as_mutable(JSON))
    table_description = Column(String)
    metadata_cache = Column(String)
    metadata_cache_is_up_to_date = Column(Boolean, default=False)  
    # Relationship
    fields = relationship("DB_Field", backref="table", cascade="all, delete-orphan")

class DB_Field(Base):
    __tablename__ = 'db_fields'
    id = Column(Integer, primary_key=True, index=True)
    ordinal_position = Column(Integer)
    field_name = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    db_id = Column(Integer, ForeignKey('db_connections.id'), nullable=False)
    table_id = Column(Integer, ForeignKey('db_tables.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    data_obfuscation_groups = Column(MutableList.as_mutable(ARRAY(String)), default=[])
    field_description = Column(String)

class Chatbot_And_Dashboards_Config(Base):
    __tablename__ = 'chatbot_and_dashboards_config'
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, nullable=False, unique=True)
    dashboard_ids = Column(MutableList.as_mutable(ARRAY(Integer)), default=[])

class Chat_Sessions(Base):
    __tablename__ = 'chat_sessions'
    id = Column(Integer, primary_key=True, index=True)
    session_hash = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    last_updated = Column(DateTime(timezone=False))
    chat_session = Column(MutableList.as_mutable(JSON)) 

class Chat_Sessions_Archive(Base):
    __tablename__ = 'chat_sessions_archive'
    id = Column(Integer, primary_key=True, index=True)
    session_hash = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    last_updated = Column(DateTime(timezone=False))
    chat_session = Column(MutableList.as_mutable(JSON))

class Chat_History(Base):
    __tablename__ = 'chat_history'
    id = Column(Integer, primary_key=True, index=True)
    session_hash = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    user_query = Column(String)
    user_query_original = Column(String)
    response = Column(String)
    response_time = Column(Numeric)
    marked_as_bad_response = Column(Boolean, default=False)
    token_count = Column(Integer)
    card_id = Column(Integer)
    last_updated = Column(DateTime(timezone=False))

class Error_Logs(Base):
    __tablename__ = 'error_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    created_at = Column(DateTime(timezone=False))
    user_query = Column(String)
    error_type = Column(String)
    error_msg = Column(String)
    error_code = Column(Integer)

class BI_Dashboards_Data(Base):
    __tablename__ = 'bi_dashboards_data'
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, nullable=False)
    tab_id = Column(Integer)
    tab_name = Column(String)
    card_id = Column(Integer, nullable=False, unique=True)
    card_name = Column(String)
    card_filters_info = Column(MutableList.as_mutable(JSON))
    card_data = Column(String)
    last_updated = Column(DateTime(timezone=False))