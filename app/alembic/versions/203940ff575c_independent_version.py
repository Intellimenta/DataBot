"""independent version

Revision ID: 203940ff575c
Revises: f3139783fdf0
Create Date: 2025-07-10 10:50:02.152785

"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '203940ff575c'
down_revision: Union[str, None] = 'f3139783fdf0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'db_connection_references' in inspector.get_table_names() and \
       'table_permissions_and_metadata' in inspector.get_table_names() and \
       'fields_metadata' in inspector.get_table_names():
        
        # rename table db_connection_references to bi_db_connection_references
        op.rename_table('db_connection_references', 'bi_db_connection_references')
        op.rename_table('table_permissions_and_metadata', 'bi_table_permissions_and_metadata')
        op.rename_table('fields_metadata', 'bi_fields_metadata')
        # update bi tables by multuplying the db_id column by -1
        op.execute("UPDATE bi_db_connection_references SET db_id = db_id * -1")
        op.execute("UPDATE bi_table_permissions_and_metadata SET db_id = db_id * -1")
        op.execute("UPDATE bi_fields_metadata SET db_id = db_id * -1")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'bi_db_connection_references' in inspector.get_table_names() and \
       'bi_table_permissions_and_metadata' in inspector.get_table_names() and \
       'bi_fields_metadata' in inspector.get_table_names():
        
        op.rename_table('bi_db_connection_references', 'db_connection_references')
        op.rename_table('bi_table_permissions_and_metadata', 'table_permissions_and_metadata')
        op.rename_table('bi_fields_metadata', 'fields_metadata')
        # update bi tables by multuplying the db_id column by -1
        op.execute("UPDATE db_connection_references SET db_id = db_id * -1")
        op.execute("UPDATE table_permissions_and_metadata SET db_id = db_id * -1")
        op.execute("UPDATE fields_metadata SET db_id = db_id * -1")
