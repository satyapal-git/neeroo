const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log(dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.cluster0.uqwlxz6.mongodb.net",
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);