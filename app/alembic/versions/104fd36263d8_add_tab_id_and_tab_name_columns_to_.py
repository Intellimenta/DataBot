"""add tab_id and tab_name columns to analytical_mode_dashboards_data

Revision ID: 104fd36263d8
Revises: d667404daedd
Create Date: 2025-06-10 19:28:43.119439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '104fd36263d8'
down_revision: Union[str, None] = 'd667404daedd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'analytical_mode_dashboards_data' in inspector.get_table_names():
        op.add_column('analytical_mode_dashboards_data', sa.Column('tab_id', sa.Integer(), nullable=True))
        op.add_column('analytical_mode_dashboards_data', sa.Column('tab_name', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'analytical_mode_dashboards_data' in inspector.get_table_names():
        op.drop_column('analytical_mode_dashboards_data', 'tab_name')
        op.drop_column('analytical_mode_dashboards_data', 'tab_id')
