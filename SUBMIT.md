# How to submit this entry to make.fun

Everything below runs on **your own machine** (the sandbox that built this repo could not reach make.fun).
You need Node 22+, git, and `gh` (GitHub CLI) signed in as `Access75`.

**Deadline: 2026-11-16 18:00 UTC.** Quota: 5 entries per UTC day, 10 in all; your last receipt before the deadline is the one scored.

Referral code on the page: `pnwxcb3w` (link `https://make.fun/r/pnwxcb3w`). If that is not the code on your
Profile → Referrals tab, fix it everywhere with:

```sh
sed -i 's/pnwxcb3w/<your-real-code>/g' index.html README.md   # then re-make ad.png (step 6) and commit
```

---

## 1. Clone the repo at this branch and get the kit

```sh
mkdir -p ~/makefun && cd ~/makefun
git clone --branch arena/a8239449-makefun-entry https://github.com/Access75/Makefun-entry.git
curl -sSL "https://make.fun/c/bring-the-humans-01/kit" | tar xz
ls   # -> Makefun-entry/  bring-the-humans-01-kit/
```

## 2. Make the agent keypair (kept OUTSIDE the repo, never committed)

```sh
cd ~/makefun
node -e "const k=require('node:crypto').generateKeyPairSync('ed25519').privateKey.export({format:'jwk'});require('node:fs').writeFileSync(process.argv[1],JSON.stringify([...Buffer.from(k.d,'base64url'),...Buffer.from(k.x,'base64url')]),{mode:0o600,flag:'wx'})" makefun-keypair.json
node Makefun-entry/scripts/wallet-address.mjs makefun-keypair.json   # prints the wallet address, e.g. 7xK...; copy it
```

## 3. Connect the keypair to @nsisong-edem (this is `makefun login`)

```sh
cd ~/makefun/bring-the-humans-01-kit
node cli/makefun.mjs login --keypair ../makefun-keypair.json --origin "https://make.fun"
```

Its first line is `Open <link> and approve code XXXX-XXXX (expires in 15 min).`
Open that link **signed in as @nsisong-edem**, check the code, approve. (Leave "Bet on markets" off unless you want it.)
Run the same `login` command again until it prints `Connected: entries now go in as @nsisong-edem`.
If it prints a different handle, stop and sort that out before submitting.

## 4. Prove the repo is yours: commit `.makefun/owner.json`

The repo owner on GitHub is `Access75`; unless that is the GitHub login linked to @nsisong-edem, the entry needs
the claim file naming the wallet from step 2:

```sh
cd ~/makefun/Makefun-entry
mkdir -p .makefun
printf '{"wallet": "%s"}\n' "$(node scripts/wallet-address.mjs ../makefun-keypair.json)" > .makefun/owner.json
cat .makefun/owner.json
git add .makefun/owner.json && git commit -m "Add make.fun owner claim" && git push origin arena/a8239449-makefun-entry
git rev-parse HEAD    # <- this 40-char sha is the commit you enter
```

(The GitHub About — homepage, topics — was already set by the agent; verify with `gh repo view Access75/Makefun-entry`.
If it is missing: `gh repo edit Access75/Makefun-entry --description 'An invite ad page for make.fun with a referral link. Built by an AI agent for make.fun'\''s "Bring the humans" bounty, $1,000 in USDC.' --homepage 'https://make.fun/bounty/bring-the-humans-01' --add-topic 'makefun,ai-agents,bounties,growth'`.)

## 5. Transcripts (required) — read this part carefully

The entry must upload the AI session(s) that wrote `index.html`. The page was built in an **Arena.ai Agent Mode**
session. Two cases:

**(a) You can export the Arena session** (a JSON/JSONL log of the messages with timestamps and token usage).
Save it outside the repo, e.g. `~/makefun/arena-session.json`, and pass it to `bundle` with `--session`.

**(b) You cannot export it.** Hand over what you can see instead, as the rules allow: write the conversation (your
messages, the agent's messages, its tool calls and results, in order) as **one JSON file** in OpenAI message form,
with top-level fields `"session_id"`, `"harness": "Arena Agent Mode"`, `"model"` (the model Arena shows for the
session), `"messages": [...]`, and `"handed_over": "Arena Agent Mode keeps no session file the user can download"`.
Do not invent timestamps or usage numbers. **Caveat:** a handed-over entry is ranked but, under this bounty's
default `handed_over_places: none`, takes **no paid place**. Only a harness-recorded log competes for the prize.

Then bundle (from inside the kit). `submit/prompt.txt` in this repo holds your opening prompt word for word:

```sh
cd ~/makefun/bring-the-humans-01-kit
printf 'withheld: Arena.ai Agent Mode does not expose its system prompt to the user\n' > ../system-prompt.txt

node cli/makefun.mjs bundle \
  --repo ../Makefun-entry \
  --session ../arena-session.json \
  --prompt-file ../Makefun-entry/submit/prompt.txt --prompt-origin typed \
  --system-prompt ../system-prompt.txt \
  --instructions none \
  --mcp none \
  --harness "Arena Agent Mode" --harness-version "2026-11" \
  --provider <provider> --model <model-id> --effort default \
  --out ../transcripts.tar.gz

node cli/makefun.mjs check --bundle ../transcripts.tar.gz --repo ../Makefun-entry
```

`bundle` tells you exactly which flag it still wants if anything is missing. Fill `--provider`/`--model` with what
the Arena session shows (plain lowercase ids, e.g. `anthropic` / `claude-…`), never `auto` or `custom`.

## 6. (Optional but recommended) replace `ad.png` with a real browser screenshot

`ad.png` in this repo is a faithful composition of the page's hero rendered with ImageMagick (the build sandbox
had no browser). A true screenshot is nicer and takes one command with Chrome installed:

```sh
cd ~/makefun/Makefun-entry
google-chrome --headless=new --window-size=1600,1000 --screenshot=ad.png "file://$PWD/index.html"
git add ad.png && git commit -m "Screenshot of the ad page" && git push origin arena/a8239449-makefun-entry
```

Then use the new `git rev-parse HEAD` in step 7.

## 7. Submit

```sh
cd ~/makefun/bring-the-humans-01-kit
node cli/makefun.mjs submit \
  --competition bring-the-humans-01 \
  --repo-url https://github.com/Access75/Makefun-entry \
  --commit "$(git -C ../Makefun-entry rev-parse HEAD)" \
  --title "Build it. Get paid. — a make.fun invite page" \
  --bundle ../transcripts.tar.gz \
  --keypair ../makefun-keypair.json
```

`submit` signs the entry message with the keypair (adding its wallet to the account if needed) and uploads.
Then watch it:

```sh
node cli/makefun.mjs status            # per-check verdicts; fix what it names and re-submit (same day cap: 5)
```

## 8. After the deadline

The final referral check runs 24 h after the deadline (≈ 2026-11-17 18:00 UTC). If the entry takes a paid place,
claim from the escrow with the same keypair:

```sh
node cli/makefun.mjs claim bring-the-humans-01 --keypair ../makefun-keypair.json
```

Share `https://make.fun/r/pnwxcb3w` widely before 18:00 UTC — the score is verified human signups through that
link during the window, and only real people count (same person/network, IP clusters, idle accounts and bots are
all excluded).
