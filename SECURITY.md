# Security Policy

## Supported Versions

Only the latest version of PvdAI (deployed at [pvdai.tech](https://pvdai.tech)) is actively maintained.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a vulnerability, open a [GitHub Security Advisory](https://github.com/julianaijal/PvdAI/security/advisories/new) (private by default).

Include as much detail as possible:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any suggested fix (optional)

You can expect an acknowledgement within a few days. If the vulnerability is confirmed, a fix will be prioritized and you will be credited in the release notes (unless you prefer to remain anonymous).

## Scope

This project is a read-only document browser. The main security considerations are:

- **Rate limiting** — 20 questions/day per IP, stored as HMAC-SHA256 hashes
- **Input validation** — all API inputs validated with Zod
- **No user accounts or passwords** — there is no authentication system
- **OpenAI API key** — stored as a server-side environment variable, never exposed to the client
