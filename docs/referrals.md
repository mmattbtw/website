# Updating referral links

The page lives at `/support/referrals` and is linked from the homepage.

## Edit a file

Edit `src/data/referrals.json`. Add, remove, or reorder objects in `links`.
Deploy as usual. No JSX changes needed.

Each link needs `name`, `url`, and `benefit`. Optional fields are `reward`,
`code`, `detailsUrl`, and `detailsLabel`. Text is plain text, not Markdown.
URLs must use HTTPS. `benefit` describes what the visitor gets; `reward`
describes what Matt gets. Don't put Matt's Chase referral earnings in `benefit`.

## Edit on ATProto without deploying

The page also reads one public record from the account configured by
`NEXT_PUBLIC_BSKY_DID` and `NEXT_PUBLIC_BSKY_PDS`:

- Collection: `net.mmatt.support.referrals`
- Record key: `self`
- Record body: the entire contents of `src/data/referrals.json`

Create or edit it with a record editor that supports custom collections.
Paste the JSON file as the record body. Keep `$type` and `links`.
The schema is in `lexicons/net/mmatt/support/referrals.json`.
The fixed `self` key follows the [ATProto singleton record convention](https://atproto.com/specs/record-key).

For an authenticated API client, use `com.atproto.repo.putRecord` with:

```json
{
  "repo": "YOUR_ACCOUNT_DID",
  "collection": "net.mmatt.support.referrals",
  "rkey": "self",
  "record": { "$type": "net.mmatt.support.referrals", "links": [] }
}
```

Replace `record` with your full list. An empty list deliberately hides all links.
The website only reads public records and needs no password or app password.
This change does not create a record or publish the lexicon to your account.

A valid PDS record replaces the whole local list. Updates appear on the next
visit after the five-minute cache revalidates. If the record is missing,
malformed, or the PDS is unreachable, the page uses the local JSON list.
Delete the PDS record to return to file-based editing.
