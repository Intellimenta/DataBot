"""rename analytical_mode_dashboards_data

Revision ID: 7af78b2ba33b
Revises: 72a809da5a77
Create Date: 2025-12-29 21:02:21.566359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '7af78b2ba33b'
down_revision: Union[str, None] = '72a809da5a77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'analytical_mode_dashboards_data' in inspector.get_table_names():
        op.rename_table('analytical_mode_dashboards_data', 'bi_dashboards_data')


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'bi_dashboards_data' in inspector.get_table_names():
        op.rename_table('bi_dashboards_data', 'analytical_mode_dashboards_data')
