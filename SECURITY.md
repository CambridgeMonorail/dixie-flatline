# Security Policy

## Supported Versions

Dixie Flatline is currently experimental and pre-1.0. Security fixes will target the latest `main` branch until releases are formalized.

## Reporting a Vulnerability

Please do not open public issues for vulnerabilities or leaked credentials.

Report privately through GitHub private vulnerability reporting when available for this repository, or contact the maintainers through the repository owner.

Include:

- affected version or commit
- reproduction steps
- impact
- any suggested mitigation

## Secrets

Do not commit real credentials. Use `.env.example` for documentation and keep local `.env` files ignored.

If a secret is committed, rotate it immediately. Deleting the file is not enough if the secret exists in Git history.
