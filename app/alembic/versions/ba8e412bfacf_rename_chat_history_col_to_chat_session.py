"""rename chat_history col to chat_session

Revision ID: ba8e412bfacf
Revises: 4c63b4a91d12
Create Date: 2025-11-07 12:54:16.924620

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'ba8e412bfacf'
down_revision: Union[str, None] = '4c63b4a91d12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'chat_sessions' in inspector.get_table_names():
        op.alter_column('chat_sessions', 'chat_history', new_column_name='chat_session')


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'chat_sessions' in inspector.get_table_names():
        op.alter_column('chat_sessions', 'chat_session', new_column_name='chat_history')