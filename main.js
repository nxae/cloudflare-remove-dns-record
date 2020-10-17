/**
 * Remove Cloudflare DNS Record Action for GitHub
 * Originally forked from https://github.com/kriasoft/create-dns-record
 */

const cp = require("child_process");

const event = require(process.env.GITHUB_EVENT_PATH);
const pr = event.pull_request ? event.pull_request.number : "?";

//https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
const getCurrentRecordId = () => {
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `https://api.cloudflare.com/client/v4/zones/${process.env.INPUT_ZONE}/dns_records`,
  ]);
  const { success, result, errors } = JSON.parse(stdout.toString());
  const name = (process.env.INPUT_NAME || "")
    .replace(/\{pr\}/gi, pr)
    .replace(/\{pr_number\}/gi, pr)
    .replace(/\{head_ref\}/gi, process.env.GITHUB_HEAD_REF);
  const record = result.find((x) => x.name === name);

  if (status !== 0) {
    process.exit(status);
  }
  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }
  if (!record) {
    return null
  }
  return record.id;
};

const deleteRecord = (id) => {
  // https://api.cloudflare.com/#dns-records-for-a-zone-delete-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--silent", "--request", "DELETE"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `https://api.cloudflare.com/client/v4/zones/${process.env.INPUT_ZONE}/dns_records/${id}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }
};

const id = process.env.INPUT_ID || getCurrentRecordId();
if (!id) {
  console.log("Record doesn't exist. Nothing to delete.");
  process.exit(0);
}
deleteRecord(id);
