#!/usr/bin/env python3
"""
Generate INSERT SQL for an admin user. Hash format matches src/server/admin.ts.

Usage:
  python3 scripts/create_admin.py <email> <password> [role]
  role defaults to 'owner'.

Then pipe the SQL into wrangler:
  SQL=$(python3 scripts/create_admin.py admin@lool.work 'StrongPass123!')
  wrangler d1 execute lool-work --local --command "$SQL"
  # And for prod once v2 is deployed:
  # wrangler d1 execute lool-work --remote --command "$SQL"
"""

import base64
import hashlib
import os
import secrets
import string
import sys
import time

ITERATIONS = 100_000


def hash_password(plain: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt, ITERATIONS)
    return f"pbkdf2${ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(key).decode()}"


def nanoid(size: int = 21) -> str:
    alphabet = string.digits + string.ascii_uppercase + string.ascii_lowercase
    return "".join(secrets.choice(alphabet) for _ in range(size))


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    email = sys.argv[1].strip().lower()
    password = sys.argv[2]
    role = sys.argv[3] if len(sys.argv) > 3 else "owner"
    if role not in ("owner", "staff"):
        print(f"Invalid role: {role} (must be 'owner' or 'staff')", file=sys.stderr)
        sys.exit(2)

    pw_hash = hash_password(password)
    admin_id = nanoid()
    now_ms = int(time.time() * 1000)

    sql = (
        "INSERT INTO admin_users "
        "(id, email, password_hash, role, active, created_at, updated_at) VALUES "
        f"('{admin_id}', '{email}', '{pw_hash}', '{role}', 1, {now_ms}, {now_ms});"
    )
    print(sql)


if __name__ == "__main__":
    main()
