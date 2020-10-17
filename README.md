# Delete DNS Record Action for GitHub

Deletes CloudFlare DNS record by ID or record name.

## Usage

Inside ```[project_root]/.github/workflows/[cf-remove-dns].yaml``` create or include below lines in repo's workflow file

```yaml
name: CI removing CF DNS record
on:
  pull_request:
    type: [closed]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: nxae/cloudflare-remove-dns-record@v2
        with:
          name: "{PR}-review.${{ secrets.DOMAIN }}"
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
          zone: ${{ secrets.CLOUDFLARE_ZONE }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).