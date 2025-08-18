"""add card_filters_info col to analytical_mode_dashboards_data

Revision ID: d667404daedd
Revises: 88fb66cacd6c
Create Date: 2025-06-08 22:19:03.046101

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'd667404daedd'
down_revision: Union[str, None] = '88fb66cacd6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'analytical_mode_dashboards_data' in inspector.get_table_names():
        op.add_column('analytical_mode_dashboards_data', sa.Column('card_filters_info', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'analytical_mode_dashboards_data' in inspector.get_table_names():
        op.drop_column('analytical_mode_dashboards_data', 'card_filters_info')
