const YAML = require("yaml");

const noop = () => {};

const defaultYaml = `
delimiter: ??
separator: ","
mapping: {}
resStatusCode: 200
OverrideResHeaders: {}
`;

/**
 * @type {{
 *   delimiter: string,
 *   separator: string,
 *   mapping: Record<String, String>,
 *   resStatusCode: number,
 *   OverrideResHeaders: Record<String, String>,
 * }}
 */
const defaultConf = YAML.parse(defaultYaml);

function normalizeUrl({ delimiter, separator, url }) {
  return url
    .replace(delimiter, "??")
    .split(separator || ",")
    .join(",");
}

function unfoldUrlCombo({ delimiter, separator, url }) {
  const nUrl = normalizeUrl({ delimiter, separator, url });
  const urlParsed = new URL(nUrl);
  const prefix = `${urlParsed.origin}${urlParsed.pathname}`;
  return urlParsed.search
    .slice(2)
    .split(",")
    .map((e) => `${prefix}${e}`);
}

module.exports = function (server, options) {
  server.on("request", async (req, res) => {
    req.on("error", noop);
    res.on("error", noop);

    const ruleValue = YAML.parse(
      decodeURIComponent(req.headers[options.RULE_VALUE_HEADER]),
    );
    const finalRule = Object.assign({}, defaultConf, ruleValue);

    const rewriteList = unfoldUrlCombo({
      url: req.fullUrl,
      delimiter: finalRule.delimiter,
      separator: finalRule.separator,
    }).map((curUrl) => {
      for (const regex in finalRule.mapping) {
        const regRaw = regex.slice(1, regex.lastIndexOf("/"));
        const modifier = regex.slice(regex.lastIndexOf("/") + 1);
        if (new RegExp(regRaw, modifier).test(curUrl)) {
          return finalRule.mapping[regex];
        }
      }
      return curUrl;
    });
    /**
     * @type {Uint8Array[]}
     */
    const comboBuffer = Array.from({ length: rewriteList.length });
    const tasks = rewriteList.map(async (e, idx) => {
      const data = await fetch(e).then((e) => e.arrayBuffer());
      comboBuffer[idx] = new Uint8Array(data);
    });
    await Promise.all(tasks);

    const client = req.request((svrRes) => {
      delete svrRes.headers["content-length"];
      delete svrRes.headers["content-encoding"];
      res.writeHead(
        finalRule.resStatusCode,
        Object.assign({}, svrRes.headers, finalRule.OverrideResHeaders),
      );
      res.end(Buffer.concat(comboBuffer));
    });
    req.pipe(client);
  });
};
