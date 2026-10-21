# n8n-nodes-verified-net

An [n8n](https://n8n.io) community node for [Verified.net](https://verified.net): verify email addresses, validate
phone numbers, look up the live carrier and porting status, check IP addresses, verify contacts and run reverse
lookups, right inside your workflows. It also works as a tool for n8n AI agents.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Example](#example) · [Resources](#resources)

## Installation

In n8n: **Settings → Community Nodes → Install**, enter `n8n-nodes-verified-net` and confirm. See n8n's
[community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

1. Create a free account at [app.verified.net](https://app.verified.net/signup) and an API key on the
   [API keys](https://app.verified.net/keys) page.
2. In n8n, add a **Verified.net API** credential and paste the key. Leave **Base URL** as it is.

n8n tests the credential by reading your account balance (free).

## Operations

| Resource | Operation | What it returns | Credits |
|---|---|---|---|
| Email | Verify | Syntax, mail server, mailbox, disposable, role and typo checks, risk score and an `accept` / `review` / `reject` recommendation | 1 |
| Email | Reverse Lookup | Registrant contacts for an email address | 10, only when found |
| Phone | Validate | Format, line type, region, original carrier, VoIP, spam reports, recommendation | 1 |
| Phone | Get Carrier | Live current carrier, porting status and line type (US and Canada) | 3 |
| Phone | Reverse Lookup | Caller ID name (Standard) and registrant contacts (Premium), US and Canada | 10 / 25, only when found |
| IP Address | Look Up | Location, network, Tor and datacenter detection, risk score | 1 |
| Contact | Verify | Whether a name and/or phone match the records for an email (match levels only) | 1 |
| Account | Get | Credit balance and usage | free |

Invalid input is free, and the same value checked again within 7 days is free. Turn on **Bypass Cache** (under
Options) to force a fresh, charged check. Field reference: [verified.net/docs](https://verified.net/docs).

## Example

Clean a signup form before it reaches your CRM:

1. **Webhook** (or your form tool's trigger) receives `email`.
2. **Verified.net** → Email → Verify, with Email set to `{{ $json.email }}`.
3. **Switch** on `{{ $json.recommendation.action }}`: `accept` → add to the CRM, `review` → send to a person,
   `reject` → drop it.

For whole lists, use the HTTP Request node with the [bulk jobs API](https://verified.net/docs#bulk) (up to 100,000
values per job), or loop over items with this node.

## Errors

API errors stop the node with the API's status (for example `402` when your balance is empty or `429` when you
send too fast). Use the node's **Settings → On Error → Continue** to keep the workflow going, and **Retry On
Fail** for temporary errors.

## Compatibility

Built with `@n8n/node-cli` and tested on n8n 2.44. No runtime dependencies.

## Resources

- [Verified.net API docs](https://verified.net/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Guide: [Verified.net with Zapier, Make and n8n](https://verified.net/guides/zapier-make-n8n)

## License

MIT
