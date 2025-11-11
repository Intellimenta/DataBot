"""add session_hash to chat_sessions and chat_ghistory tables

Revision ID: 4c63b4a91d12
Revises: 5d9664b24b01
Create Date: 2025-11-06 14:32:47.303355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '4c63b4a91d12'
down_revision: Union[str, None] = '5d9664b24b01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'chat_history' in inspector.get_table_names():
        op.add_column('chat_history', sa.Column('session_hash', sa.String()))
    if 'chat_sessions' in inspector.get_table_names():
        op.add_column('chat_sessions', sa.Column('session_hash', sa.String()))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'chat_history' in inspector.get_table_names():
        op.drop_column('chat_history', 'session_hash')
    if 'chat_sessions' in inspector.get_table_names():
        op.drop_column('chat_sessions', 'session_hash')