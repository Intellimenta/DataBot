"""Add created_at column to users table and columns session_id, user_query_original, response_time, marked_as_bad_response to chat_history table

Revision ID: d52b413f3830
Revises: 
Create Date: 2025-05-20 16:43:47.120969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'd52b413f3830'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)

    if 'chat_history' in inspector.get_table_names():
        op.add_column('chat_history', sa.Column('user_query_original', sa.String(), nullable=True))
        op.add_column('chat_history', sa.Column('response_time', sa.Numeric(), nullable=True))
        op.add_column('chat_history', sa.Column('marked_as_bad_response', sa.Boolean(), nullable=True))
    if 'users' in inspector.get_table_names():
        op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
        


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'chat_history' in inspector.get_table_names():
        op.drop_column('chat_history', 'marked_as_bad_response')
        op.drop_column('chat_history', 'response_time')
        op.drop_column('chat_history', 'user_query_original')
    if 'users' in inspector.get_table_names():
        op.drop_column('users', 'created_at')
